import { prisma } from "../src/lib/db";

async function main() {
  const entity = await prisma.entity.upsert({
    where: { slug: "lumen-park" },
    update: {},
    create: {
      slug: "lumen-park",
      name: "Lumen Park",
      bio: "A ceramicist and city-walker who documents quiet public spaces, weekend markets, and the craft of making useful objects. Entirely fictional — no real-person likeness.",
      personality:
        "Warm, curious, slightly wry. Speaks in short sensory observations. Never sarcastic about people; only about overcomplicated gadgets. Mixes English with a little Portuguese when excited about food.",
      canonicalDescription:
        "East Asian woman in her late 20s, 168cm, shoulder-length black hair with blunt bangs and a faint rust-red ribbon clip on the left. Oval face, monolid eyes, a small mole above the right corner of the mouth, light freckles on the nose. Neutral expression that breaks into a closed-mouth smile.",
      faceNotes:
        "Oval face, straight brows, monolid brown eyes, small mole above right mouth corner, light nose freckles, natural skin, no heavy contour. Hair: shoulder-length black, blunt bangs, rust-red ribbon clip on the left.",
      bodyNotes:
        "Lean build, 168cm, slightly broad shoulders from studio work. Hands often have faint clay dust or a thin silver band on the right middle finger.",
      wardrobePalette:
        "Clay, oat, rust, forest green, indigo denim, cream. Natural fibers. One rust-red accent per look. Avoid neon, logos, sequins, and haute-couture gowns.",
      styleDo:
        "Lived-in clothes, rolled sleeves, canvas tote, simple gold hoops, practical sneakers or loafers. Natural window light. Documentary / editorial stills.",
      styleDont:
        "Do not change face shape, hair length, or ethnicity. No celebrity lookalikes, no lingerie, no weapons, no brand-name logos, no extra limbs, no text overlays.",
      locale: "pt-PT",
      timezone: "Europe/Lisbon",
      languages: "en, pt",
      accounts: {
        create: [
          {
            platform: "X",
            handle: "@lumenpark",
            status: "LIVE",
            notes: "Posts if X OAuth user tokens are present; otherwise stays queued.",
          },
          {
            platform: "XIAOHONGSHU",
            handle: "lumen.park",
            status: "STUB",
            notes: "Xiaohongshu open platform OAuth + note.publish — not live in MVP.",
          },
          {
            platform: "TIKTOK",
            handle: "@lumenpark",
            status: "STUB",
            notes: "TikTok Content Posting API — stub.",
          },
          {
            platform: "BILIBILI",
            handle: "LumenPark",
            status: "STUB",
            notes: "Bilibili archive / live APIs — stub. Video & streaming are scaffolded.",
          },
        ],
      },
      events: {
        create: [
          {
            type: "HOBBY",
            title: "Thursday glaze tests at the shared kiln",
            description:
              "Testing a rust-and-oat glaze on four breakfast bowls. The studio radio is playing a quiet bossa playlist. Hands in clay, afternoon light through the north window.",
            location: "Marvila ceramic studio, Lisbon",
            startsAt: new Date(Date.now() + 1000 * 60 * 60 * 26),
            mood: "focused, content",
            companions: "studio neighbor Inês",
            status: "PLANNED",
          },
          {
            type: "DINING",
            title: "Sardines and vinho verde at the river kiosk",
            description:
              "Early dinner after a market walk. Grilled sardines, lemon, a small glass of vinho verde. Watching ferries while the bowls cool in her tote.",
            location: "Cais do Sodré kiosk, Lisbon",
            startsAt: new Date(Date.now() + 1000 * 60 * 60 * 50),
            mood: "easy, salty air",
            companions: "",
            status: "PLANNED",
          },
          {
            type: "SHOPPING",
            title: "Linen remnants at Feira da Ladra",
            description:
              "Hunting oat and forest-green linen scraps for tea towels. Bargaining badly, laughing about it, leaving with too much fabric anyway.",
            location: "Feira da Ladra, Alfama",
            startsAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
            mood: "playful",
            companions: "",
            status: "DONE",
          },
          {
            type: "TRAVEL",
            title: "Day trip to Sintra for moss and azulejos",
            description:
              "Train, mist, palace tiles as color research — not as a tourist checklist. Sketching glaze ideas on a folded receipt.",
            location: "Sintra, Portugal",
            startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6),
            mood: "wonder",
            companions: "",
            status: "PLANNED",
          },
        ],
      },
      videoProjects: {
        create: {
          title: "Studio afternoon — still sequence",
          description:
            "Scaffold: ordered stills → future mp4. No ffmpeg in the MVP; this records the storyboard.",
          status: "DRAFT",
        },
      },
      streamSessions: {
        create: {
          title: "Throwing bowls, live (future)",
          platform: "YOUTUBE",
          status: "PLANNED",
          startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
          notes:
            "Target platforms later: YouTube Live, Twitch, Bilibili live. No encoder in this MVP.",
        },
      },
    },
  });

  console.log(`Seeded entity ${entity.name} (${entity.slug})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
