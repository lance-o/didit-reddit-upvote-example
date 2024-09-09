import { CommentForm } from "@/components/CommentForm";
import { CommentList } from "@/components/CommentList";
import { Pagination } from "@/components/Pagination";
import { Vote } from "@/components/Vote";
import { db } from "@/db";
import Link from "next/link";

export async function generateMetadata({ params, searchParams }, parent) {
  // load the post
  const { rows: users } = await db.query(
    `SELECT * FROM users where users.name = '${params.name}'`
  );
  const user = users[0]; // get the first one
  return {
    title: user.name,
  };
}

export default async function UserPage({ params }) {
  const name = params.name;

  const { rows: users } = await db.query(
    `
    SELECT
      users.id,
      users.name,
      users.image,
      json_agg(posts ORDER BY posts.created_at DESC) AS userposts
    FROM users
    LEFT JOIN posts ON posts.user_id = users.id
    where
      users.name = '${name}'
    GROUP BY users.id
    LIMIT 1;
  `
  );

  const user = users[0];

  console.log(user);

  return (
    <>
      <img className="w-200 h-200" src={user.image} alt="helo"></img>
      <ul className="max-w-screen-lg mx-auto p-4 mb-4">
        {user.userposts.map((post) => (
          <li
            key={post.id}
            className=" py-4 flex space-x-6 hover:bg-zinc-200 rounded-lg"
          >
            <Vote postId={post.id} votes={post.vote_total} />
            <div>
              <Link
                href={`/post/${post.id}`}
                className="text-3xl hover:text-pink-500"
              >
                {post.title}
              </Link>
              <p className="text-zinc-700">posted by {post.name}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
