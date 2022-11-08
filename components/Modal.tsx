import React, {
  BaseSyntheticEvent,
  ChangeEventHandler,
  Fragment,
  useRef,
  useState,
} from "react";
import { useRecoilState } from "recoil";
import { modalState } from "../atoms/modalAtom";
import { Transition, Dialog } from "@headlessui/react";
import { CameraIcon, EmojiHappyIcon } from "@heroicons/react/outline";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { db, storage } from "../firebase";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useSession } from "next-auth/react";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { BaseEmoji } from "emoji-mart";

export interface AddEmojisToInput {
  emoticons: string[];
  id: string;
  keywords: string[];
  name: string;
  native: string;
  shortcodes: string;
  unified: string;
}

const Modal = () => {
  const [open, setOpen] = useRecoilState(modalState);
  const filePickerRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const [input, setInput] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const addEmoji = (e: BaseEmoji) => {
    const sym: string[] = e.unified.split("-");

    const codesArray: any[] = [];

    sym.forEach((el) => codesArray.push("0x" + el));

    const emoji = String.fromCodePoint(...codesArray);

    setInput(input + emoji);
  };

  const uploadPost = async () => {
    if (loading) return;
    setLoading(true);
    // 1) create a post and add to fireStore 'posts' collection
    const docRef = await addDoc(collection(db, "posts"), {
      id: session?.user.uid,
      username: session?.user.username,
      profileImg: session?.user.image,
      caption: input,
      timestamp: serverTimestamp(),
    });
    // 2) get the post ID for the newly created post
    const imageRef = ref(storage, `posts/${docRef.id}/image`);
    // 3) upload the image to firebase storage with the post ID
    if (selectedFile) {
      await uploadString(imageRef, selectedFile, "data_url").then(async () => {
        // 4) get a download URL from fb storage and update the original post with image
        const downLoadUrl = await getDownloadURL(imageRef);
        await updateDoc(doc(db, "posts", docRef.id), {
          image: downLoadUrl,
        });
      });
    }

    setOpen(false);
    setInput("");
    setLoading(false);
    setShowEmojis(false);
    setSelectedFile(null);
  };

  const addImageToPost: ChangeEventHandler = (e: BaseSyntheticEvent) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
    reader.onload = (readerEvent) => {
      setSelectedFile(readerEvent.target?.result as string);
    };
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={setOpen}
      >
        <div className="flex items-end justify-center min-h-[800px] sm:min-h-screen pt-4 px-4 pb-24 text-center sm:p-0 sm:block">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
          </Transition.Child>
          {/* This element is to trick the browser into centering the modal contents */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              <div>
                {selectedFile ? (
                  <img
                    src={selectedFile}
                    alt=""
                    onClick={() => setSelectedFile(null)}
                    className="object-contain w-full cursor-pointer"
                  />
                ) : (
                  <div
                    onClick={() => filePickerRef.current.click()}
                    className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full cursor-pointer"
                  >
                    <CameraIcon
                      aria-hidden="true"
                      className="w-6 h-6 text-red-600"
                    />
                  </div>
                )}

                <div className="relative">
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Upload a photo
                    </Dialog.Title>
                    <div>
                      <input
                        type="file"
                        hidden
                        ref={filePickerRef}
                        onChange={addImageToPost}
                      />
                    </div>
                    <div className="flex mt-2">
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        type="text"
                        onFocus={() => setShowEmojis(false)}
                        className="w-full text-center border-none focus:ring-0"
                        placeholder="Please enter a caption..."
                      />
                      <div
                        className="cursor-pointer w-9 h-9 hover:bg-[#1d9bf0] hover:bg-opacity-10 flex items-center justify-center rounded-full transition ease-out"
                        onClick={() => setShowEmojis((prevState) => !prevState)}
                      >
                        <EmojiHappyIcon className="text-[#1d9bf0] h-7" />
                      </div>
                    </div>
                  </div>

                  {showEmojis && (
                    <div
                      className="max-w-xs rounded-3xl h-[350px]"
                      onClick={() => setOpen(true)}
                    >
                      <div className="flex justify-center">
                        <Picker data={data} onEmojiSelect={addEmoji} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm disabled:bg-gray-300 disabled:cursor-not-allowed hover:disabled:bg-gray-300"
                    disabled={!input.trim() && !selectedFile}
                    onClick={uploadPost}
                  >
                    {loading ? "Uploading..." : "Upload Post"}
                  </button>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Modal;
