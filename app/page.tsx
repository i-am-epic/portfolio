import { redirect } from "next/navigation"

// The portfolio now opens into the explorable Minecraft-style 3D world at /world.
// The original bento experience is preserved at /classic (and still reachable from
// the "Skip to classic site" button inside the world).
export default function Home() {
  redirect("/world")
}
