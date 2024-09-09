import { auth } from "@/auth";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/LoginButton";
import { LogoutButton } from "@/components/LogoutButton";
import Tiptap from "@/components/Tiptap";

let error = "";
let prevError = "";

function handleError(userId, title, content) {
  let tempError = "";
  if (!userId) {
    tempError += `You be logged in to be able to post.\n`;
  }
  if (title == "") {
    tempError += `Your post title must have at least one character.\n`;
  } else if (title.length > 255) {
    tempError += `You cannot have more than 255 characters your post title.\n`;
  }
  if (content == "") {
    tempError += `Your post must have at least one character.\n`;
  }
  if (tempError !== "") {
    prevError = error;
    error = tempError;
    return true;
  }
  return false;
}

export default async function Home() {
  const session = await auth();

  if (error === prevError) {
    error = "";
  } else {
    prevError = error;
  }

  async function savePost(formData) {
    "use server";
    const content = formData.get("content");
    const title = formData.get("title");
    const userId = session?.user?.id;
    if (handleError(userId, title, content)) {
      revalidatePath("/add-post");
      return;
    }

    await db.query(
      "INSERT INTO posts (title, body, user_id) VALUES ($1, $2, $3)",
      [title, content, userId]
    );

    revalidatePath("/");
    redirect("/");
  }

  if (!session) {
    return (
      <div className="max-w-screen-lg mx-auto p-4 mt-10">
        You need to login to create a post <LoginButton />
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto p-4 bg-zinc-800 mt-10 rounded-xl">
      <h2 className="text-3xl mb-4">Add a new post</h2>
      <form action={savePost} className="flex flex-col space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Post title..."
          className="text-black px-3 py-2 rounded"
        />
        <textarea
          name="content"
          className="text-black px-3 py-2 rounded"
          placeholder="Post content"
        />
        <button className="bg-green-400 px-4 py-2 text-xl text-black rounded">
          Submit post
        </button>
      </form>
      {error != "" ? (
        <h1 className="flex justify-center bg-red-500 whitespace-pre rounded p-3">
          {error}
        </h1>
      ) : null}
    </div>
  );
}
