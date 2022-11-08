import React, { FC, MouseEventHandler, useEffect, useState } from "react";
import {
  BookmarkIcon,
  ChatIcon,
  DotsHorizontalIcon,
  EmojiHappyIcon,
  HeartIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/outline";
import { HeartIcon as HeartIconFilled } from "@heroicons/react/solid";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useSession } from "next-auth/react";
import { db } from "../firebase";
import Moment from "react-moment";
import { BaseEmoji } from "emoji-mart";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const Post: FC<{ post: DocumentData; id: string }> = ({ post, id }) => {
  const { data: session } = useSession();
  const [comments, setComments] = useState<DocumentData[]>([]);
  const [comment, setComment] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [likes, setLikes] = useState<DocumentData[]>([]);
  const [liked, setLiked] = useState(false);

  const addEmoji = (e: BaseEmoji) => {
    const sym: string[] = e.unified.split("-");

    const codesArray: any[] = [];

    sym.forEach((el) => codesArray.push("0x" + el));

    const emoji = String.fromCodePoint(...codesArray);

    setComment(comment + emoji);
  };

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, "posts", id, "comments"),
          orderBy("timestamp", "desc")
        ),
        (snapshot) => setComments(snapshot.docs)
      ),
    [db, id]
  );

  useEffect(
    () =>
      onSnapshot(collection(db, "posts", id, "likes"), (snapshot) =>
        setLikes(snapshot.docs)
      ),
    [db, id]
  );

  useEffect(
    () =>
      setLiked(
        likes.findIndex((like) => like.id === session?.user?.uid) !== -1
      ),
    [likes]
  );

  const likePost = async () => {
    if (liked) {
      await deleteDoc(doc(db, "posts", id, "likes", session?.user.uid!));
    } else {
      await setDoc(doc(db, "posts", id, "likes", session?.user.uid!), {
        username: session?.user.username,
      });
    }
  };

  const sendComment: MouseEventHandler = async (e) => {
    e.preventDefault();

    const commentToSend = comment;
    setComment("");

    await addDoc(collection(db, "posts", id, "comments"), {
      comment: commentToSend,
      username: session?.user.username,
      userImage: session?.user.image,
      timestamp: serverTimestamp(),
    });
  };

  return (
    <div className="bg-white border rounded-sm my-7">
      {/* Headers */}

      <div className="flex items-center p-5">
        <img
          src={post.profileImg}
          alt=""
          className="object-contain w-12 h-12 p-1 mr-3 border rounded-full"
        />
        <p className="flex-1 font-bold">{post.username}</p>
        <DotsHorizontalIcon className="h-5" />
      </div>

      {/* img */}

      <img src={post.image} alt="" className="object-cover w-full" />

      {/* Buttons */}

      {session && (
        <div className="flex justify-between px-4 pt-4">
          <div className="flex space-x-4">
            {liked ? (
              <HeartIconFilled
                className="text-red-500 btn"
                onClick={likePost}
              />
            ) : (
              <HeartIcon className="btn" onClick={likePost} />
            )}
            <ChatIcon className="btn" />
            <PaperAirplaneIcon className="btn" />
          </div>
          <BookmarkIcon className="btn " />
        </div>
      )}

      {/* Captions */}

      <p className="p-5 truncate">
        {likes.length > 0 && (
          <span className="block mb-1 font-bold">{likes.length} likes</span>
        )}
        <span className="mr-1 font-bold">{post.username} </span> {post.caption}
      </p>

      {/* Comments */}

      {comments.length > 0 && (
        <div className="h-20 ml-10 overflow-y-scroll scrollbar-thumb-black scrollbar-thin">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-center mb-3 space-x-2">
              <img
                className="rounded-full h-7"
                src={comment.data().userImage}
                alt=""
              />
              <p className="flex-1 text-sm">
                <span className="mr-2 font-bold">
                  {comment.data().username}
                </span>
                {comment.data().comment}
              </p>

              <Moment fromNow className="pr-5 text-xs">
                {comment.data().timestamp?.toDate()}
              </Moment>
            </div>
          ))}
        </div>
      )}

      {/* Input Box */}

      {session && (
        <form className="relative flex items-center p-4">
          <div onClick={() => setShowEmojis((prevState) => !prevState)}>
            <EmojiHappyIcon className="cursor-pointer h-7" />
          </div>
          <input
            onFocus={() => setShowEmojis(false)}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            type="text"
            className="flex-1 border-none focus:ring-0"
            placeholder="Add a Comment"
          />
          {showEmojis && (
            <div className="absolute max-w-xs rounded-3xl h-[350px] mb-[600px]">
              <div className="flex justify-center">
                <Picker data={data} onEmojiSelect={addEmoji} />
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={!comment.trim()}
            className="font-semibold text-blue-400"
            onClick={sendComment}
          >
            post
          </button>
        </form>
      )}
    </div>
  );
};

export default Post;
