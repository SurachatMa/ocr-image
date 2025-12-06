import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import ImageUploader from './components/ImageUploader';
import OCRForm from './components/OCRForm';
import CameraCapture from './components/CameraCapture';
import { cn } from './utils/cn';

// Semantic Styles
const STYLES = {
  container: "min-h-screen text-gray-300 font-sans p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden",
  decorativeGlow: {
    red: "absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-samurai-red opacity-[0.03] blur-[150px] rounded-full pointer-events-none",
    blue: "absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-blue-900 opacity-[0.05] blur-[150px] rounded-full pointer-events-none"
  },
  header: {
    wrapper: "mb-12 text-center relative z-10",
    badge: "inline-block mb-4 px-3 py-1 bg-samurai-glass border border-samurai-border rounded-full text-xs font-mono tracking-widest text-samurai-red uppercase",
    title: "text-4xl md:text-6xl font-bold font-mono text-white mb-2 tracking-tighter",
    subtitle: "text-gray-500 max-w-md mx-auto"
  },
  mainLayout: "w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10",
  section: {
    left: "flex flex-col gap-6",
    right: (isActive) => cn(
      "transition-all duration-500",
      isActive ? 'opacity-100 translate-x-0' : 'opacity-50 translate-x-4 blur-sm grayscale'
    )
  },
  card: {
    glass: "glass-card rounded-2xl p-1 shadow-2xl",
    inner: "bg-samurai-dark/50 rounded-xl p-6 md:p-8 border border-white/5",
    logWrapper: "glass-card rounded-2xl p-6",
    logContent: "bg-black/40 rounded-lg p-4 font-mono text-xs text-green-500/80 h-48 overflow-y-auto border border-white/5 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
  },
  headings: "text-xl font-mono font-bold text-white mb-6 flex items-center gap-2",
  progressBar: {
    wrapper: "w-full bg-gray-800 rounded-full h-1 overflow-hidden",
    bar: "bg-samurai-red h-full transition-all duration-300 relative",
    glow: "absolute inset-0 bg-white/20 animate-pulse"
  }
};

function App() {
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [extractedData, setExtractedData] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showCamera, setShowCamera] = useState(false);

  const handleImageUpload = (file, imageSrc) => {
    setImage(imageSrc);
    setOcrText('');
    setExtractedData({});
    processImage(imageSrc);
  };

  const handleCameraCapture = (imageSrc) => {
    setShowCamera(false);
    setImage(imageSrc);
    setOcrText('');
    setExtractedData({});
    processImage(imageSrc);
  };

  const processImage = async (imageSrc) => {
    setIsProcessing(true);
    setProgress(0);
    try {
      const result = await Tesseract.recognize(
        imageSrc,
        'tha+eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(parseInt(m.progress * 100));
            }
          }
        }
      );

      const text = result.data.text;
      setOcrText(text);
      const parsedData = parseOCRResult(text);
      setExtractedData(parsedData);
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Error during OCR processing. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseOCRResult = (text) => {
    // 1. Pre-processing: Aggressive cleanup
    // Remove lines that are just symbols
    const lines = text.split('\n')
      .map(line => line.trim().replace(/^[=\-_|!\\/?:;,.<>)(*&^%$#@`~]+|[=\-_|!\\/?:;,.<>)(*&^%$#@`~]+$/g, '').trim())
      .filter(line => line.length > 2); // Ignore very short lines usually noise

    const data = {
      idNumber: '',
      title: '',
      firstName: '',
      lastName: '',
      dob: '',
      address: ''
    };

    // --- Helper Functions ---
    const isThaiYear = (y) => parseInt(y) > 2400 && parseInt(y) < 2600;
    const isEngYear = (y) => parseInt(y) > 1900 && parseInt(y) < 2100;

    // Common OCR misreads for "นาย" (Nai)
    const titleCorrections = {
      'WIE': 'นาย', 'Wle': 'นาย', 'Wie': 'นาย', 'VlE': 'นาย',
      'u18': 'นาย', 'uาย': 'นาย', 'Mr.': 'นาย',
      'u1.': 'น.ส.', 'Miss': 'นางสาว', 'Ms.': 'นางสาว',
      'Mrs.': 'นาง'
    };

    // --- Search Logic ---

    // 1. ID Number: 1-xxxx-xxxxx-xx-x (13 digits)
    // Find all 13-digit sequences from the FULL text to avoid line break issues
    const fullText = lines.join(' ');
    // Look for digits that might have spaces/dashes between them
    const potentialIds = fullText.match(/(?:\d[\s-]?){12}\d/g) || [];

    for (const rawId of potentialIds) {
      const cleanId = rawId.replace(/\D/g, '');
      // standard Thai ID usually doesn't start with 0, and not 9 consecutively? 
      // Just take the first valid-looking 13 digit number found (usually top left)
      if (cleanId.length === 13) {
        // Check checksum could be added here, but for now just format it
        data.idNumber = cleanId.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5');
        break; // Stop after first match as it's usually the ID number at top
      }
    }


    // 2. Name
    // Search for line with "ชื่อตัว" or "Name" or "Last name" adjacent
    // OR look for our Title Keywords
    let nameFound = false;

    // Try finding a line starting with known titles first (fuzzy corrected)
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Correct common title errors in the line
      Object.keys(titleCorrections).forEach(wrong => {
        if (line.includes(wrong)) {
          line = line.replace(wrong, titleCorrections[wrong]);
        }
      });

      const titles = ['นาย', 'นางสาว', 'นาง', 'เด็กชาย', 'เด็กหญิง'];
      // Check if line contains a title pattern
      const foundTitle = titles.find(t => line.includes(t));

      // Must also NOT be the English Name line if we want Thai (English line usually starts with Mr/Mrs)
      // But if we replaced Mr -> นาย, we need to be careful. 
      // Usually Thai name is above English name.
      if (foundTitle && !nameFound) {
        // Heuristic: If line contains "Name" or "Last" it might be the English line, skip if we want Thai
        // AND check if contains Thai characters
        const hasThai = /[\u0E00-\u0E7F]/.test(line);
        if (!hasThai) continue;

        // Extract
        data.title = foundTitle;
        // Remove everything before the title
        const titleIdx = line.indexOf(foundTitle);
        let afterTitle = line.substring(titleIdx + foundTitle.length).trim();

        // Cleanup "สกุล" if it appears (common label "ชื่อตัวและชื่อสกุล")
        afterTitle = afterTitle.replace(/ชื่อตัว|ชื่อสกุล|สกุล/g, '').trim();

        const parts = afterTitle.split(/\s+/).filter(p => p.length > 1);
        if (parts.length > 0) data.firstName = parts[0];
        // If the next part is on same line, it's last name
        if (parts.length > 1) {
          // Verify it's not a label like "Name"
          if (!/Name|Last/i.test(parts[1])) {
            data.lastName = parts.slice(1).join(' ');
          }
        }

        // If Last Name not found on this line, check next line for "สกุล" or just text
        if (!data.lastName && lines[i + 1]) {
          let nextLine = lines[i + 1];
          if (nextLine.includes('Last name') || nextLine.includes('Name')) {
            // likely English line, ignore
          } else if (nextLine.includes('สกุล')) {
            data.lastName = nextLine.replace(/.*สกุล/g, '').trim();
          }
        }
        nameFound = true;
        break; // Found one, stop
      }
    }


    // 3. Date of Birth
    // Look for patterns like "20 พ.ย. 2530" or "20 Nov 1987"
    // Regex for date: digits + (Thai month abbr | Eng month abbr) + digits
    const monthRegex = /(ม\.ค|ก\.พ|มี\.ค|เม\.ย|พ\.ค|มิ\.ย|ก\.ค|ส\.ค|ก\.ย|ต\.ค|พ\.ย|ธ\.ค|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i;

    for (const line of lines) {
      if (monthRegex.test(line)) {
        // Check for valid year (Thai or Eng)
        const yearMatch = line.match(/\d{4}/);
        if (yearMatch) {
          const year = parseInt(yearMatch[0]);
          if (isThaiYear(year) || isEngYear(year)) {
            // We found a line with Month and Year. 
            // Extract the date part. usually "DD Month YYYY"
            // Find the sequence
            const tokens = line.split(/\s+/);
            const monthIdx = tokens.findIndex(t => monthRegex.test(t));
            if (monthIdx > 0) {
              const day = tokens[monthIdx - 1].match(/\d+/);
              if (day) {
                // day month year
                const foundYear = tokens.slice(monthIdx + 1).find(t => /\d{4}/.test(t));
                if (foundYear) {
                  data.dob = `${day[0]} ${tokens[monthIdx]} ${foundYear}`;
                  // Break unless we think this is Date of Issue/Expiry
                  // DOB usually comes first or has label "เกิด"
                  if (line.includes('เกิด') || line.includes('Birth')) break;
                }
              }
            }
          }
        }
      }
    }


    // 4. Address
    // Search for specific Address indicators: "หมู่ที่", "ต.", "อ.", "จ.", "ถนน", "ซอย"
    // Start capturing from the first line that looks like an address until we hit a date or "No." line
    let addressBuffer = [];
    let parsingAddress = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Keywords that start an address
      if (/ที่อยู่|หมู่ที่|หมู่|ถนน|ซอย|แขวง|ตำบล|อำเภอ|จังหวัด|ต\.|อ\.|จ\./.test(line)) {
        // Ignore if it's just the label line "ที่อยู่" with nothing else
        const content = line.replace(/ที่อยู่|Address/g, '').trim();
        if (content.length > 0) {
          parsingAddress = true;
          addressBuffer.push(content);
        } else if (lines[i + 1]) {
          parsingAddress = true; // Address starts next line
        }
      } else if (parsingAddress) {
        // Continue adding lines unless we hit a "Date line" (Issue/Expire) or ID number or Barcode noise
        if (/วันออกบัตร|Issue|Expire|หมดอายุ|Date|Of|Birth/i.test(line)) {
          parsingAddress = false;
        } else if (line.match(/\d{13}/)) {
          parsingAddress = false;
        } else {
          addressBuffer.push(line);
        }
      }

      // Safety Break for address length
      if (parsingAddress && addressBuffer.length > 3) parsingAddress = false;
    }

    if (addressBuffer.length > 0) {
      data.address = addressBuffer.join(' ').trim();
    }

    return data;
  };

  const handleDataChange = (field, value) => {
    setExtractedData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={STYLES.container}>
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Decorative background glow */}
      <div className={STYLES.decorativeGlow.red}></div>
      <div className={STYLES.decorativeGlow.blue}></div>

      <header className={STYLES.header.wrapper}>
        <div className={STYLES.header.badge}>
          AI Powered // OCR System
        </div>
        <h1 className={STYLES.header.title}>
          SAMUR<span className="text-samurai-red">.AI</span>
        </h1>
        <p className={STYLES.header.subtitle}>
          Advanced extraction for Thai National ID Cards.
        </p>
      </header>

      <main className={STYLES.mainLayout}>

        {/* Left Col: Upload Stage */}
        <section className={STYLES.section.left}>
          <div className={STYLES.card.glass}>
            <div className={STYLES.card.inner}>
              <h2 className={STYLES.headings}>
                <span className="w-2 h-2 bg-samurai-red rounded-full"></span>
                UPLOAD SOURCE
              </h2>

              <ImageUploader
                onImageUpload={handleImageUpload}
                isProcessing={isProcessing}
                onRequestCamera={() => setShowCamera(true)}
              />

              {isProcessing && (
                <div className="mt-6">
                  <div className="flex justify-between text-xs font-mono text-samurai-red mb-2">
                    <span>PROCESSING_MATRIX</span>
                    <span>{progress}%</span>
                  </div>
                  <div className={STYLES.progressBar.wrapper}>
                    <div
                      className={STYLES.progressBar.bar}
                      style={{ width: `${progress}%` }}
                    >
                      <div className={STYLES.progressBar.glow}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Raw Text Log - moved to left side to balance height if image is not huge */}
          {image && (
            <div className={STYLES.card.logWrapper}>
              <h2 className="text-sm font-mono text-gray-400 mb-3 uppercase tracking-wider">System Logs</h2>
              <div className={STYLES.card.logContent}>
                <p className="mb-2 text-gray-600">// Extracting text nodes...</p>
                {ocrText || "Waiting for input stream..."}
              </div>
            </div>
          )}
        </section>

        {/* Right Col: Extracted Data Form */}
        <section className={STYLES.section.right(image)}>
          <div className={cn(STYLES.card.glass, "h-full")}>
            <div className={cn(STYLES.card.inner, "h-full")}>
              <div className="flex items-center justify-between mb-8">
                <h2 className={STYLES.headings}>
                  <span className="text-samurai-red">02</span> // DATA EXTRACTION
                </h2>
                <div className="px-2 py-1 rounded bg-green-500/10 text-green-500 text-xs font-mono border border-green-500/20">
                  STATUS: {image ? 'ACTIVE' : 'IDLE'}
                </div>
              </div>

              <OCRForm data={extractedData} onChange={handleDataChange} />

              {!image && (
                <div className="absolute inset-0 flex items-center justify-center bg-samurai-black/60 backdrop-blur-sm rounded-xl z-10">
                  <p className="font-mono text-gray-500 text-sm">Waiting for source image...</p>
                </div>
              )}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;
