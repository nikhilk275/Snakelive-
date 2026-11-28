import React, { useEffect, useRef, useState } from 'react';
import { supabase } from "./supabaseClient";
import "./index.css";

const INITIAL_POSTS = [
  { id: "init-1", user: "Maya Chen", loc: "Swiss Alps · 24m", cap: "Sometimes the best way to reconnect is to disconnect." },
  { id: "init-2", user: "Aarav Verma", loc: "Jaipur · 2h", cap: "Night sky views and calm vibes on snakelive." },
];

const STREAMS = [
  { id: 1, title: "Late Night Gaming & Chill", plat: "YouTube Live", url: "https://youtube.com" },
  { id: 2, title: "Live Coding & Tech Talk", plat: "Twitch", url: "https://twitch.tv" },
  { id: 3, title: "Weekend IRL Vibes", plat: "Kick", url: "https://kick.com" },
  { id: 4, title: "Creator Live Q&A", plat: "Facebook Live", url: "https://facebook.com" },
];


const MUSIC_SEEN_KEY = "snakelive_music_welcome_seen_v1";
const MUSIC_SUGGESTIONS_KEY = "snakelive_song_suggestions_v1";
const DEFAULT_MUSIC_TRACKS = [
  {
    id: "track-1",
    title: "Late Night Vibes",
    artist: "Snakelive Music",
    src: "/Snakelive-/music/track1.mp3",
  },
  {
    id: "track-2",
    title: "Chill Session",
    artist: "Snakelive Music",
    src: "/Snakelive-/music/track2.mp3",
  },
];

function MusicModal({ isOpen, onClose, onOpen, isPlaying, setIsPlaying }) {
  const audioRef = useRef(null);
  const [tracks, setTracks] = useState(DEFAULT_MUSIC_TRACKS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [songTitle, setSongTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/Snakelive-/music/playlist.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setTracks(data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const seen = localStorage.getItem(MUSIC_SEEN_KEY);
    if (!seen) {
      localStorage.setItem(MUSIC_SEEN_KEY, "true");
      onOpen();
    }
  }, [onOpen]);

  const currentTrack = tracks[currentIndex] || DEFAULT_MUSIC_TRACKS[0];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
        setStatusMsg("Audio file nahi mili—public/music/ mein .mp3 check karein.");
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentIndex, currentTrack?.src, setIsPlaying]);

  const handlePlayMusic = () => {
    setStatusMsg("");
    setIsPlaying(true);
    onClose();
  };

  const handleNextTrack = () => {
    setStatusMsg("");
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  const handleSuggestSubmit = (e) => {
    e.preventDefault();
    const cleanTitle = songTitle.trim();
    const cleanArtist = artistName.trim();
    if (!cleanTitle) {
      setStatusMsg("Pehle favorite song ka naam likhein.");
      return;
    }
    const existing = JSON.parse(localStorage.getItem(MUSIC_SUGGESTIONS_KEY) || "[]");
    existing.unshift({
      title: cleanTitle,
      artist: cleanArtist || "Any Artist",
      suggestedAt: new Date().toISOString(),
    });
    localStorage.setItem(MUSIC_SUGGESTIONS_KEY, JSON.stringify(existing));
    setSongTitle("");
    setArtistName("");
    setShowSuggestForm(false);
    setStatusMsg(`"${cleanTitle}" suggestion save ho gaya!`);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack?.src}
        preload="none"
        onEnded={handleNextTrack}
      />
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(2, 6, 23, 0.78)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              backgroundColor: "#0f172a",
              color: "#f8fafc",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#34d399" }}>
                Music 🎶 • Live
              </span>
              <button
                type="button"
                onClick={onClose}
                style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "18px", cursor: "pointer", padding: "2px 6px" }}
                aria-label="Close music popup"
              >
                ✕
              </button>
            </div>

            <h2 style={{ margin: "10px 0 6px", fontSize: "20px", fontWeight: 700 }}>
              Live Music Chal Raha Hai 🎶
            </h2>
            <p style={{ margin: "0 0 14px", fontSize: "14px", lineHeight: 1.5, color: "#cbd5e1" }}>
              Queue: <strong>{currentTrack?.title}</strong> — {currentTrack?.artist}
            </p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handlePlayMusic}
                style={{
                  flex: 1,
                  minWidth: "150px",
                  backgroundColor: "#10b981",
                  color: "#042f2e",
                  fontWeight: 700,
                  border: "none",
                  borderRadius: "10px",
                  padding: "11px 14px",
                  cursor: "pointer",
                }}
              >
                ▶ Play Live Music
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusMsg("");
                  setShowSuggestForm((prev) => !prev);
                }}
                style={{
                  flex: 1,
                  minWidth: "150px",
                  backgroundColor: "#1e293b",
                  color: "#f8fafc",
                  fontWeight: 600,
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  padding: "11px 14px",
                  cursor: "pointer",
                }}
              >
                Suggest Your Favorite Song
              </button>
            </div>

            {showSuggestForm && (
              <form
                onSubmit={handleSuggestSubmit}
                style={{
                  marginTop: "14px",
                  paddingTop: "14px",
                  borderTop: "1px solid rgba(148, 163, 184, 0.2)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <input
                  type="text"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="Favorite song ka naam *"
                  style={{
                    backgroundColor: "#020617",
                    color: "#f8fafc",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    fontSize: "14px",
                  }}
                />
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Artist / Mood (optional)"
                  style={{
                    backgroundColor: "#020617",
                    color: "#f8fafc",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    fontSize: "14px",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#38bdf8",
                    color: "#082f49",
                    fontWeight: 700,
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    cursor: "pointer",
                  }}
                >
                  Send Suggestion
                </button>
              </form>
            )}

            {statusMsg && (
              <p style={{ margin: "12px 0 0", fontSize: "13px", color: "#6ee7b7" }}>
                {statusMsg}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMsg, setAuthMsg] = useState("");

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setUser(data.session?.user ?? null);
      })
      .catch(() => {});

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchPosts();

return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("id, user_id, content, created_at")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const formatted = data.map((row) => ({
          id: row.id,
          user: row.user_id ? `Creator (${row.user_id.slice(0, 6)})` : "snakelive User",
          loc: row.created_at ? new Date(row.created_at).toLocaleString() : "Just now",
          cap: row.content,
        }));
        setPosts([...formatted, ...INITIAL_POSTS]);
      }
    } catch (_) {}
  };

  const addPost = async (e) => {
    e.preventDefault();
    setStatusMsg("");
    if (!text.trim()) return;

    if (!user) {
      setStatusMsg("Post karne ke liye pehle Account tab mein Login ya Sign Up karein.");
      return;
    }

    setPosting(true);
    try {
      const { error } = await supabase.from("posts").insert({
        content: text.trim(),
        user_id: user.id,
      });

      if (error) {
        setStatusMsg(error.message);
      } else {
        setText("");
        setStatusMsg("Post publish ho gayi!");
        fetchPosts();
      }
    } catch (err) {
      setStatusMsg(err?.message || "Post karte waqt error aaya.");
    } finally {
      setPosting(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthMsg("");

    if (!email.trim() || !password.trim()) {
      setAuthMsg("Email aur password dono dalein.");
      return;
    }

    if (password.length < 6) {
      setAuthMsg("Password kam se kam 6 characters ka hona chahiye.");
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          setAuthMsg(error.message);
        } else if (data?.session) {
          setAuthMsg("Account ban gaya aur aap login ho chuke hain!");
          setEmail("");
          setPassword("");
        } else {
          setAuthMsg("Account ban gaya! Email confirmation on ho toh inbox/spam check karein, warna Login tab se login karein.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setAuthMsg(error.message);
        } else {
          setAuthMsg("Login successful!");
          setEmail("");
          setPassword("");
        }
      }
    } catch (err) {
      setAuthMsg(err?.message || "Request complete nahi ho payi. Thodi der baad try karein.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setAuthMsg("Logged out.");
    } catch (err) {
      setAuthMsg(err?.message || "Logout mein error aaya.");
    }
  };

  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const handleOpenMusic = React.useCallback(() => setIsMusicOpen(true), []);
  const handleCloseMusic = React.useCallback(() => setIsMusicOpen(false), []);
  return (
    <div>
      <header className="topbar">
        <span className="brand">snakelive</span>
<button type="button" onClick={() => setIsMusicOpen(true)} style={{ backgroundColor: isPlaying ? "#10b981" : "#1e293b", color: isPlaying ? "#042f2e" : "#e2e8f0", border: "1px solid rgba(148, 163, 184, 0.3)", borderRadius: "999px", padding: "4px 10px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>{isPlaying ? "♪ Music On" : "♪ Music"}</button>
      </header>

      <main className="container">
        {tab === "home" && (
          <>
            <h1>Your feed</h1>
            <form className="form" onSubmit={addPost}>
              <input
                className="input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  user
                    ? "Write a post on snakelive..."
                    : "Login karke post likhein (Account tab mein jayein)..."
                }
              />
              <button className="btn" type="submit" disabled={posting}>
                {posting ? "Posting..." : "Post"}
              </button>
            </form>

            {statusMsg && (
              <div className="card" style={{ marginBottom: 12 }}>
                <div className="meta">{statusMsg}</div>
              </div>
            )}

            {posts.map((p) => (
              <div className="card" key={p.id}>
                <div className="meta">
                  {p.user} · {p.loc}
                </div>
                <div>{p.cap}</div>
              </div>
            ))}
          </>
        )}

        {tab === "live" && (
          <>
            <h1>Live Hub</h1>
            {STREAMS.map((s) => (
              <div className="card" key={s.id}>
                <div style={{ fontWeight: 600 }}>{s.title}</div>
                <div className="meta" style={{ marginTop: 4 }}>
                  {s.plat}
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "notices" && (
          <>
            <h1>Public Notices</h1>
            <div className="card">
              <div className="meta">ANNOUNCEMENT</div>
              <div>snakelive local build is active with zero platform watermark.</div>
            </div>
          </>
        )}

        {tab === "groups" && (
          <>
            <h1>Groups</h1>
            <div className="card">
              <div style={{ fontWeight: 600 }}>Creators & Streamers Hub</div>
              <div className="meta" style={{ marginTop: 4 }}>
                4.8K members
              </div>
            </div>
          </>
        )}

        {tab === "account" && (
          <>
            <h1>Account</h1>

            {user ? (
              <div className="card">
                <div style={{ fontWeight: 600 }}>snakelive Creator</div>
                <div className="meta" style={{ marginTop: 4 }}>
                  Logged in: {user.email}
                </div>
                <div className="meta" style={{ marginTop: 4 }}>
                  Total Posts: {posts.length}
                </div>
                <button
                  className="btn"
                  type="button"
                  onClick={handleLogout}
                  style={{ marginTop: 12 }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="card">
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  {authMode === "login" ? "Login to snakelive" : "Create snakelive Account"}
                </div>

                <form className="form" onSubmit={handleAuth} style={{ flexDirection: "column", gap: 8 }}>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                  />
                  <input
                    className="input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 6 chars)"
                  />
                  <button className="btn" type="submit" disabled={authLoading}>
                    {authLoading
                      ? "Please wait..."
                      : authMode === "login"
                      ? "Login"
                      : "Sign Up"}
                  </button>
                </form>

                <button
                  className="btn"
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "signup" : "login");
                    setAuthMsg("");
                  }}
                  style={{ marginTop: 10 }}
                >
                  {authMode === "login"
                    ? "Naya account banana hai? Sign Up"
                    : "Pehle se account hai? Login"}
                </button>

                {authMsg && (
                  <div className="meta" style={{ marginTop: 10 }}>
                    {authMsg}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <nav className="nav">
        {["home", "live", "notices", "groups", "account"].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>
    
      
    
      <MusicModal isOpen={isMusicOpen} onOpen={handleOpenMusic} onClose={handleCloseMusic} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
    </div>);
}
