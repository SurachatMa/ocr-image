import React from 'react';
import { cn } from '../utils/cn';

const FORM_STYLES = {
    wrapper: "w-full",
    stack: "space-y-5",
    label: "block text-xs font-mono text-gray-500 mb-1 tracking-wider uppercase",
    input: "glass-input w-full px-4 py-3 rounded-lg text-white font-mono tracking-wider",
    inputNormal: "glass-input w-full px-4 py-3 rounded-lg text-white",
    textarea: "glass-input w-full px-4 py-3 rounded-lg text-white resize-none"
};

const OCRForm = ({ data, onChange }) => {
    return (
        <div className={FORM_STYLES.wrapper}>
            <div className={FORM_STYLES.stack}>
                <div>
                    <label className={FORM_STYLES.label}>
                        ID Number // เลขประจำตัวประชาชน
                    </label>
                    <input
                        type="text"
                        name="idNumber"
                        value={data.idNumber || ''}
                        onChange={(e) => onChange('idNumber', e.target.value)}
                        className={FORM_STYLES.input}
                        placeholder="x-xxxx-xxxxx-xx-x"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={FORM_STYLES.label}>
                            Title // คำนำหน้า
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={data.title || ''}
                            onChange={(e) => onChange('title', e.target.value)}
                            className={FORM_STYLES.inputNormal}
                            placeholder="นาย/นาง/นางสาว"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={FORM_STYLES.label}>
                            First Name // ชื่อ
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={data.firstName || ''}
                            onChange={(e) => onChange('firstName', e.target.value)}
                            className={FORM_STYLES.inputNormal}
                        />
                    </div>
                    <div>
                        <label className={FORM_STYLES.label}>
                            Last Name // นามสกุล
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={data.lastName || ''}
                            onChange={(e) => onChange('lastName', e.target.value)}
                            className={FORM_STYLES.inputNormal}
                        />
                    </div>
                </div>

                <div>
                    <label className={FORM_STYLES.label}>
                        Date of Birth // วันเกิด
                    </label>
                    <input
                        type="text"
                        name="dob"
                        value={data.dob || ''}
                        onChange={(e) => onChange('dob', e.target.value)}
                        className={FORM_STYLES.inputNormal}
                        placeholder="DD/MM/YYYY"
                    />
                </div>

                <div>
                    <label className={FORM_STYLES.label}>
                        Address // ที่อยู่
                    </label>
                    <textarea
                        name="address"
                        rows="3"
                        value={data.address || ''}
                        onChange={(e) => onChange('address', e.target.value)}
                        className={FORM_STYLES.textarea}
                    ></textarea>
                </div>
            </div>
        </div>
    );
};

export default OCRForm;
