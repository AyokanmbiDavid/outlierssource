
import React, { useState } from "react";
import { Users, MessageCircle, Search, Plus, X } from "lucide-react";

const initialPosts = [
  { id: 1, author: "Department Admin", role: "Administrator", category: "Announcement", title: "Welcome to the student community", body: "Use this space to connect with classmates, share academic ideas and participate in departmental discussions.", replies: 12 },
  { id: 2, author: "Computer Science Students", role: "Student Group", category: "Discussion", title: "What programming language are you learning?", body: "Let's share the programming languages we are currently learning and the projects we are building.", replies: 8 },
  { id: 3, author: "Academic Support", role: "Academic Support", category: "Study Group", title: "Preparing for upcoming examinations", body: "Share useful study strategies and organise group revision sessions.", replies: 5 }
];

export default function Community() {
  const [posts, setPosts] = useState(initialPosts);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const addPost = () => {
    if (!title.trim() || !body.trim()) return;
    setPosts([{ id: Date.now(), author: "You", role: "Student", category: "Discussion", title, body, replies: 0 }, ...posts]);
    setTitle("");
    setBody("");
    setShowForm(false);
  };

  const filtered = posts.filter(post =>
    `${post.title} ${post.body} ${post.category}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm text-[#81918B]">Connect and collaborate</p>
        <h1 className="text-2xl font-bold text-[#20302D] mt-1">Student Community</h1>
        <p className="text-sm text-[#81918B] mt-2">Share ideas, ask questions and learn together.</p>
      </div>

      <div className="bg-[#E4F2EF] rounded-3xl p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white text-[#176D68] flex items-center justify-center"><Users size={28} /></div>
        <div>
          <h2 className="font-bold text-[#20302D]">A better way to learn together</h2>
          <p className="text-sm text-[#71827C] mt-1">Join academic conversations and student discussions.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3">
          <Search size={18} className="text-[#81918B]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search discussions..." className="outline-none bg-transparent py-3 w-full text-sm" />
        </div>
        <button onClick={() => setShowForm(true)} className="bg-[#176D68] text-white rounded-xl px-5 py-3 flex items-center justify-center gap-2 text-sm font-semibold"><Plus size={18} /> Create post</button>
      </div>

      <div className="space-y-4">
        {filtered.map(post => (
          <div key={post.id} className="bg-white rounded-2xl p-5">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-semibold text-[#20302D]">{post.author}</p>
                <p className="text-xs text-[#81918B] mt-1">{post.role}</p>
              </div>
              <span className="text-xs text-[#176D68] bg-[#E4F2EF] rounded-full px-3 py-1 h-fit">{post.category}</span>
            </div>
            <h3 className="font-bold text-[#20302D] mt-5">{post.title}</h3>
            <p className="text-sm text-[#71827C] mt-2 leading-6">{post.body}</p>
            <button onClick={() => setSelected(post)} className="mt-5 text-sm text-[#176D68] font-semibold flex items-center gap-2"><MessageCircle size={17} /> {post.replies} replies · Join discussion</button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between"><h2 className="font-bold text-lg">Create a post</h2><button onClick={() => setShowForm(false)}><X /></button></div>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title" className="w-full bg-[#F5F8F6] rounded-xl p-3 outline-none text-sm" />
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write something..." rows={5} className="w-full bg-[#F5F8F6] rounded-xl p-3 outline-none text-sm resize-none" />
            <button onClick={addPost} className="w-full bg-[#176D68] text-white rounded-xl py-3">Publish post</button>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex justify-between"><h2 className="font-bold">Discussion</h2><button onClick={() => setSelected(null)}><X /></button></div>
            <h3 className="font-bold text-lg mt-5">{selected.title}</h3>
            <p className="text-sm text-[#71827C] mt-3">{selected.body}</p>
            <p className="text-xs text-[#81918B] mt-5">Replies and live discussions will be enabled when the community backend is connected.</p>
            <button onClick={() => setSelected(null)} className="w-full mt-5 bg-[#176D68] text-white rounded-xl py-3">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
