import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';

// Declare gtag for TypeScript to recognize the Google Analytics function
declare const gtag: (...args: any[]) => void;

// Utility to normalize phone numbers to 254xxxxxxxxx
const normalizePhoneNumber = (input: string): string => {
    // Remove all non-digit characters
    let cleaned = input.replace(/\D/g, '');

    // Case 1: Starts with 0 (e.g., 0712345678) -> Remove 0, prepend 254
    if (cleaned.startsWith('0') && cleaned.length === 10) {
        cleaned = '254' + cleaned.substring(1);
    }
    // Case 2: Starts with 7 or 1 (e.g., 712345678) -> Prepend 254
    else if ((cleaned.startsWith('7') || cleaned.startsWith('1')) && cleaned.length === 9) {
        cleaned = '254' + cleaned;
    }
    // Case 3: Already starts with 254
    // Just ensure it's the right length in validation

    return cleaned;
};

const validatePhoneNumber = (phone: string): boolean => {
    return /^254\d{9}$/.test(phone);
};

// --- THEMES ---

const themes = [
    { name: 'Light', style: { background: '#ffffff', color: '#111827', secondaryColor: '#6b7280' } },
    { name: 'Dark', style: { background: '#1f2937', color: '#f9fafb', secondaryColor: '#9ca3af' } },
    { name: 'Pure Black', style: { background: '#000000', color: '#f9fafb', secondaryColor: '#9ca3af' } },
    { name: 'Crimson Gold', style: { background: 'linear-gradient(to right, #642b73, #c6426e)', color: '#ffffff', secondaryColor: '#f0d9e7' } },
    { name: 'Azure Lane', style: { background: 'linear-gradient(to right, #4e54c8, #8f94fb)', color: '#ffffff', secondaryColor: '#e0e1ff' } },
    { name: 'Emerald Sea', style: { background: 'linear-gradient(to right, #0f9b0f, #28b485)', color: '#ffffff', secondaryColor: '#d6fff1' } },
    { name: 'Solar Flare', style: { background: 'linear-gradient(to right, #f12711, #f5af19)', color: '#ffffff', secondaryColor: '#fff0d9' } },
    { name: 'Royal Amethyst', style: { background: 'linear-gradient(to right, #4527a0, #7e57c2)', color: '#ffffff', secondaryColor: '#e7dfff' } },
];

// --- COMPONENTS ---

const TweetStickerPreview = ({ data, style }) => {
    const stickerStyle = {
        background: style.background,
        color: style.color,
        padding: `${style.padding}px`,
        borderRadius: `${style.borderRadius}px`,
    };

    const secondaryTextStyle = {
        color: style.secondaryColor,
    };
    
    return (
        <div id="tweet-sticker" style={stickerStyle}>
            <div className="tweet-header">
                <img src={data.profilePic} alt="Profile" crossOrigin="anonymous" />
                <div className="tweet-author">
                    <span className="username">{data.username}</span>
                    <span className="handle" style={secondaryTextStyle}>@{data.username.toLowerCase().replace(/\s/g, '')}</span>
                </div>
            </div>
            <p className="tweet-content">{data.content}</p>
            <div className="tweet-timestamp" style={secondaryTextStyle}>{data.timestamp}</div>
        </div>
    );
};

const Editor = ({ data, setData, style, setStyle, onDownload, user }) => {
    const handleDataChange = (e) => {
        setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleStyleChange = (e) => {
        setStyle(prev => ({...prev, [e.target.name]: e.target.value }));
    };

    const handleThemeChange = (theme) => {
        setStyle(prev => ({ ...prev, ...theme.style }));
        if (typeof gtag === 'function') {
            gtag('event', 'change_theme', {
                'theme_name': theme.name,
            });
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setData(prev => ({ ...prev, profilePic: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const activeThemeName = useMemo(() => {
        return themes.find(t => t.style.background === style.background)?.name;
    }, [style.background]);

    return (
        <div className="editor-panel">
            <div className="editor-sections-container">
                <div className="editor-section">
                    <h2 className="section-title">Content</h2>
                    <div className="control-group">
                        <label>Profile Picture</label>
                        <div className="profile-pic-uploader">
                            <img src={data.profilePic} alt="Current profile" className="profile-pic-preview" />
                            <label htmlFor="profile-pic-input" className="upload-button-label">
                                Upload Image
                            </label>
                            <input 
                                id="profile-pic-input"
                                type="file" 
                                accept="image/png, image/jpeg, image/gif, image/webp" 
                                onChange={handleImageUpload} 
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>
                    <div className="control-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" name="username" value={data.username} onChange={handleDataChange} />
                    </div>
                    <div className="control-group">
                        <label htmlFor="content">Tweet Text</label>
                        <textarea id="content" name="content" value={data.content} onChange={handleDataChange} />
                    </div>
                    <div className="control-group">
                        <label htmlFor="timestamp">Timestamp</label>
                        <input type="text" id="timestamp" name="timestamp" value={data.timestamp} onChange={handleDataChange} />
                    </div>
                </div>

                <div className="editor-section">
                    <h2 className="section-title">Appearance</h2>
                    <div className="control-group">
                        <label>Theme</label>
                        <div className="theme-selector">
                            {themes.map(theme => (
                                <button 
                                    key={theme.name}
                                    className={`theme-button ${activeThemeName === theme.name ? 'active' : ''}`}
                                    style={{ background: theme.style.background }}
                                    onClick={() => handleThemeChange(theme)}
                                    aria-label={`Select ${theme.name} theme`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="control-group">
                        <label htmlFor="padding">Padding ({style.padding}px)</label>
                        <input type="range" id="padding" name="padding" min="16" max="64" value={style.padding} onChange={handleStyleChange} />
                    </div>
                    <div className="control-group">
                        <label htmlFor="borderRadius">Border Radius ({style.borderRadius}px)</label>
                        <input type="range" id="borderRadius" name="borderRadius" min="0" max="40" value={style.borderRadius} onChange={handleStyleChange} />
                    </div>
                </div>
            </div>

            <button className="download-button" onClick={onDownload}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Sticker
            </button>
        </div>
    );
};

// --- LOGIN PAGE ---

const LoginPage = ({ onLogin }) => {
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phoneInput, setPhoneInput] = useState('');
    const [otpInput, setOtpInput] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [normalizedPhone, setNormalizedPhone] = useState('');

    const handlePhoneSubmit = (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const normalized = normalizePhoneNumber(phoneInput);
            if (!validatePhoneNumber(normalized)) {
                setError('Please enter a valid Kenya phone number (e.g., 0712345678)');
                return;
            }
            
            setNormalizedPhone(normalized);
            setStep('otp');
        } catch (err) {
            setError('Invalid phone number format');
        }
    };

    const handleOtpSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (otpInput === '123456') {
            onLogin({ phone: normalizedPhone });
        } else {
            setError('Invalid verification code. Try 123456');
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto'
        }}>
            <div style={{
                background: '#1C1C1C',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid #333',
                width: '100%',
                boxSizing: 'border-box',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}>
                <h2 style={{ margin: '0 0 1.5rem 0', textAlign: 'center', fontSize: '1.5rem' }}>
                    {step === 'phone' ? 'Welcome Back' : 'Verify Phone'}
                </h2>
                
                {step === 'phone' && (
                    <form onSubmit={handlePhoneSubmit} className="control-group">
                        <label htmlFor="phone">Phone number (Kenya)</label>
                        <input 
                            type="tel" 
                            id="phone" 
                            placeholder="0712345678" 
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            autoFocus
                        />
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '-0.5rem' }}>
                            We'll send an SMS code to verify your number.
                        </div>
                        {error && <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</div>}
                        <button type="submit" className="download-button" disabled={isLoading} style={{ marginTop: '0.5rem' }}>
                            {isLoading ? 'Sending...' : 'Continue'}
                        </button>
                    </form>
                )}

                {step === 'otp' && (
                    <form onSubmit={handleOtpSubmit} className="control-group">
                        <div style={{ textAlign: 'center', marginBottom: '1rem', color: '#aaa' }}>
                            Enter the code sent to <br/>
                            <strong style={{ color: '#fff' }}>{normalizedPhone}</strong>
                        </div>
                        <label htmlFor="otp">Verification Code</label>
                        <input 
                            type="text" 
                            id="otp" 
                            placeholder="123456" 
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                            maxLength={6}
                            autoFocus
                            style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.2rem' }}
                        />
                        {error && <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</div>}
                        <button type="submit" className="download-button" disabled={isLoading} style={{ marginTop: '0.5rem' }}>
                            {isLoading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => { setStep('phone'); setError(''); }}
                            style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', marginTop: '1rem', textDecoration: 'underline' }}
                        >
                            Change Phone Number
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};


// --- MAIN APP ---

const getFormattedTimestamp = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    const date = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    return `${time} · ${date}`;
};

const App = () => {
    // Auth State
    const [user, setUser] = useState<{ phone: string } | null>(null);

    const [data, setData] = useState({
        profilePic: 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg',
        username: 'Njivai',
        content: 'Just created this amazing Tweet-to-Sticker generator! ✨\n\nNow you can turn any thought into a shareable masterpiece.\n\n#2027 #millionare',
        timestamp: getFormattedTimestamp(),
    });

    const [style, setStyle] = useState({
        ...themes[1].style, // Default to Dark theme
        padding: 32,
        borderRadius: 24,
    });
    
    const previewPanelRef = useRef(null);

    const handleLogin = (loggedInUser) => {
        setUser(loggedInUser);
        // Optionally update username based on phone/lookup in real app
    };

    const handleDownload = () => {
        const stickerElement = document.getElementById('tweet-sticker');
        if (stickerElement) {
            // Track download event with Google Analytics
            if (typeof gtag === 'function') {
                const activeTheme = themes.find(t => t.style.background === style.background);
                gtag('event', 'download_sticker', {
                    'theme_name': activeTheme ? activeTheme.name : 'Custom',
                    'padding': style.padding,
                    'border_radius': style.borderRadius,
                });
            }

            html2canvas(stickerElement, {
                backgroundColor: null, 
                useCORS: true,
                logging: false,
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'tweet-sticker.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }).catch(err => {
                console.error("Oops, something went wrong!", err);
                alert("Could not download the sticker. The profile image might be protected by CORS policy. Try a different image URL.");
            });
        }
    };

    return (
        <div className="app-container">
            <header>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="#0099ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 7L12 12L22 7" stroke="#0099ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 12V22" stroke="#0099ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h1>TweetSticker Studio</h1>
            </header>
            <main>
                {!user ? (
                    <LoginPage onLogin={handleLogin} />
                ) : (
                    <>
                        <Editor 
                            data={data} setData={setData} 
                            style={style} setStyle={setStyle} 
                            onDownload={handleDownload}
                            user={user}
                        />
                        <section 
                            className="preview-panel" 
                            aria-label="Tweet Sticker Preview"
                            ref={previewPanelRef}
                        >
                            <TweetStickerPreview 
                                data={data} 
                                style={style} 
                            />
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}