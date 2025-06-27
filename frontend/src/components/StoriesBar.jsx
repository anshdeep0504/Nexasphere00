import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import gsap from "gsap";
import { Dialog, DialogContent } from "./ui/dialog";

const dummyStories = [
  { id: 1, userName: "your_story", profilePicture: "", expiry: 0.2, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" },
  { id: 2, userName: "alice", profilePicture: "", expiry: 0.7, image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80" },
  { id: 3, userName: "bob", profilePicture: "", expiry: 0.5, image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80" },
  { id: 4, userName: "charlie", profilePicture: "", expiry: 0.9, image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80" },
  { id: 5, userName: "dave", profilePicture: "", expiry: 0.3, image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80" },
  { id: 6, userName: "eve", profilePicture: "", expiry: 0.6, image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80" },
  { id: 7, userName: "frank", profilePicture: "", expiry: 0.1, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" },
  { id: 8, userName: "grace", profilePicture: "", expiry: 0.8, image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80" },
];

const StoriesBar = () => {
  const { user, suggestedUsers } = useSelector((store) => store.auth);
  const stories = dummyStories;
  const containerRef = useRef();
  const ringRefs = useRef([]);
  const [selectedStory, setSelectedStory] = useState(null);

  // GSAP slide-in effect for stories
  const playAnimation = () => {
    try {
      if (!containerRef.current || !containerRef.current.children || containerRef.current.children.length === 0) return;
      gsap.fromTo(
        containerRef.current.children,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.15, duration: 1.2, ease: "power2.out" }
      );
    } catch (e) {
      // fail silently
    }
  };

  useEffect(() => {
    playAnimation();
  }, []);

  const animateRing = idx => {
    gsap.fromTo(
      ringRefs.current[idx],
      { rotate: 0 },
      { rotate: 360, duration: 0.7, ease: "power2.inOut" }
    );
  };

  return (
    <>
      <div className="flex items-center justify-between px-2 pb-1">
        <span className="font-semibold text-base text-gray-800 dark:text-gray-100">Stories</span>
        <button onClick={playAnimation} className="text-xs text-blue-500 hover:underline">Replay Animation</button>
      </div>
      <div ref={containerRef} className="w-full bg-white dark:bg-black border-b border-gray-200 dark:border-[#23232b] py-3 px-2 flex items-center gap-4 overflow-x-auto font-sans">
        {stories.map((story, idx) => (
          <div
            key={story.id}
            className="flex flex-col items-center min-w-[64px] cursor-pointer"
            onMouseEnter={() => animateRing(idx)}
            onClick={() => { animateRing(idx); setSelectedStory(story); }}
          >
            <div
              ref={el => (ringRefs.current[idx] = el)}
              className={`relative rounded-full p-[2.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 transition-shadow duration-300 shadow-md`}
            >
              <Avatar className="w-14 h-14 border-2 border-white dark:border-black">
                <AvatarImage src={story.profilePicture} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              {/* Expiry bar (24h indicator) */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 transition-all"
                  style={{ width: `${Math.round(story.expiry * 100)}%` }}
                />
              </div>
            </div>
            <span className="text-xs mt-1 text-gray-700 dark:text-gray-200 truncate w-14 text-center">
              {idx === 0 ? 'Your Story' : story.userName}
            </span>
          </div>
        ))}
      </div>
      {/* Story Modal/Section */}
      {selectedStory && (
        <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
          {selectedStory && (
            <DialogContent className="max-w-md w-full flex flex-col items-center bg-black p-0">
              <div className="flex items-center gap-2 w-full p-3 bg-black">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={selectedStory.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <span className="text-white font-semibold">{selectedStory.userName}</span>
              </div>
              <img src={selectedStory.image} alt="story" className="w-full h-80 object-cover bg-black" />
              {/* Expiry bar at top */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 transition-all"
                  style={{ width: `${Math.round(selectedStory.expiry * 100)}%` }}
                />
              </div>
            </DialogContent>
          )}
        </Dialog>
      )}
    </>
  );
};

export default StoriesBar; 