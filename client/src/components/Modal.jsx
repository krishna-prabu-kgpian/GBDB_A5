import React from 'react';

const Modal = ({ show, onClose, onConfirm, title, children }) => {
    if (!show) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                color: 'black',
                padding: '20px',
                borderRadius: '5px',
                minWidth: '300px',
                maxWidth: '500px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}>
                {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
                <div style={{ margin: '15px 0' }}>
                    {children}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    {onConfirm ? (
                        <>
                            <button onClick={onClose} style={{
                                padding: '8px 16px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}>
                                Cancel
                            </button>
                            <button onClick={onConfirm} style={{
                                padding: '8px 16px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}>
                                Confirm
                            </button>
                        </>
                    ) : (
                        <button onClick={onClose} style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}>
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
