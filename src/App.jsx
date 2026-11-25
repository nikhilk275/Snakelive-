import React, { useEffect, useState } from "react";
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

export default function App() {
  const [tab, setTab] = useState("home");
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // Auth states
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMsg, setAuthMsg] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchPosts();

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const fetchPosts = async () => {
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
    const { error } = await supabase.from("posts").insert({
      content: text.trim(),
      user_id: user.id,
    });
    setPosting(false);

    if (error) {
      setStatusMsg(error.message);
      return;
    }

    setText("");
    setStatusMsg("Post publish ho gayi!");
    fetchPosts();
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthMsg("");
    if (!email.trim() || !password.trim()) {
      setAuthMsg("Email aur password dono dalein.");
      return;
    }

    setAuthLoading(true);
    if (authMode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      setAuthLoading(false);
      if (error) {
        setAuthMsg(error.message);
      } else if (data.session) {
        setAuthMsg("Account ban gaya aur aap login ho chuke hain!");
        setEmail("");
        setPassword("");
      } else {
        setAuthMsg("Account ban gaya! Agar email confirmation on hai toh inbox check karein, warna login karein.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setAuthLoading(false);
      if (error) {
        setAuthMsg(error.message);
      } else {
        setAuthMsg("Login successful!");
        setEmail("");
        setPassword("");
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthMsg("Logged out.");
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
    </div>
  );
}
