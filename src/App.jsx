import React, { useState } from "react";
import "./index.css";

const INITIAL_POSTS = [
  { id: 1, user: "Maya Chen", loc: "Swiss Alps · 24m", cap: "Sometimes the best way to reconnect is to disconnect." },
  { id: 2, user: "Aarav Verma", loc: "Jaipur · 2h", cap: "Night sky views and calm vibes on snakelive." },
];

const STREAMS = [
  { id: 1, title: "Late Night Gaming & Chill", plat: "YouTube Live", url: "https://youtube.com" },
  { id: 2, title: "Live Coding & Tech Talk", plat: "Twitch", url: "https://twitch.tv" },
  { id: 3, title: "Weekend IRL Vibes", plat: "Kick", url: "https://kick.com" },
  { id: 4, title: "Creator Live Q&A", plat: "Facebook Live", url: "https://facebook.com" },
];

export default function App() {
  const [tab, setTab] = useState("home");
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [text, setText] = useState("");

  const addPost = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosts([{ id: Date.now(), user: "You", loc: "Just now", cap: text.trim() }, ...posts]);
    setText("");
  };

  return (
    <div>
      <header className="topbar">
        <span className="brand">snakelive</span>
        <span className="badge">No Watermark</span>
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
                placeholder="Write a post on snakelive..."
              />
              <button className="btn" type="submit">Post</button>
            </form>
            {posts.map((p) => (
              <div className="card" key={p.id}>
                <div className="meta">{p.user} · {p.loc}</div>
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
                <div className="live-tag">LIVE · {s.plat}</div>
                <div style={{ fontWeight: 600, marginTop: 4 }}>{s.title}</div>
                <a className="link" href={s.url} target="_blank" rel="noreferrer">Open Stream</a>
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
              <div className="meta" style={{ marginTop: 4 }}>4.8K members</div>
            </div>
          </>
        )}

        {tab === "account" && (
          <>
            <h1>Account</h1>
            <div className="card">
              <div style={{ fontWeight: 600 }}>snakelive Creator</div>
              <div className="meta" style={{ marginTop: 4 }}>Total Posts: {posts.length}</div>
            </div>
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
    </div>
  );
}
