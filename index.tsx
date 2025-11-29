import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';

// Declare gtag for TypeScript to recognize the Google Analytics function
declare const gtag: (...args: any[]) => void;

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

const Editor = ({ data, setData, style, setStyle, onDownload }) => {
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
                <Editor 
                    data={data} setData={setData} 
                    style={style} setStyle={setStyle} 
                    onDownload={handleDownload}
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
            </main>
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}