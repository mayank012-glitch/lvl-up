// Course order is independent of stable content IDs, preserving existing admin edits.
// Slam Balls replaces Lightning Lane and is the final station.
export const stations = [
  {
    no: "02", title: "Cargo Carry", tag: "STRENGTH + CONTROL", image: "cargo-carry-india-separated-black-lime-black-lime",
    alt: "Indian children carrying sandbags in their own wide white-marked grass lanes, with no cones.",
    description: "Bear-hug one soft sandbag below your chest, carry it around the turning cone and return to your start square. Your load and distance are set for your age group.",
    steps: ["Pick up your assigned sandbag with control.", "Carry it around the cone and back in your lane.", "Place the bag inside the start square before moving on."],
    focus: "Strength, balance and steady movement under load.",
    safety: "Rest if needed. Place the bag down; never throw it."
  },
  {
    no: "03", title: "Net Crawl", tag: "CRAWL + COORDINATION", image: "net-crawl-india-lanes-v4-black-lime",
    alt: "Indian children military crawling beneath a long common net in wide marked lanes with clear space between participants.",
    description: "Military crawl beneath one shared, full-width net across the race lanes. Stay low, move steadily and follow your wide marked lane to the far end.",
    steps: ["Lower yourself at your lane’s entrance.", "Crawl beneath the net without lifting it.", "Clear the net completely before standing up."],
    focus: "Body control, coordination and low-level movement.",
    safety: "Keep your lane and follow the marshal’s instructions. The proposed net clearance is about 60 centimetres."
  },
  {
    no: "04", title: "Sled Pull", tag: "PULL + ENDURANCE", image: "power-pull-india-black-lime",
    alt: "Indian children pulling lightweight sleds hand over hand using ropes in separate grass lanes.",
    description: "Pull your sled towards you using the rope, hand over hand. Walk to the opposite pull point within your lane, then use the second rope to pull the sled back.",
    steps: ["Take your rope after the marshal checks the lane.", "Pull the sled to the first end with controlled movements.", "Walk to the other pull point and pull it back to finish."],
    focus: "Pulling strength, grip and sustained effort.",
    safety: "Never wrap a rope around your body. Keep clear of moving sleds."
  },
  {
    no: "05", title: "Tyre Flip", tag: "STRENGTH + MOMENTUM", image: "tyre-flip-india-v2-black-lime",
    alt: "Indian children performing tyre flips in separate grass lanes with adult marshals supervising.",
    description: "Flip your assigned tyre end over end along your marked lane until it crosses the turnaround line. Then flip it back to the start point. Complete the return before moving on to Slam Balls.",
    steps: ["Wait for the marshal to assign your tyre and explain the course.", "Flip the tyre forward within your lane until it crosses the marked turnaround line.", "Turn around and flip the tyre back to the start point in the same lane.", "Wait for the marshal’s clearance, then continue to Slam Balls."],
    focus: "Full-body strength, coordination and controlled effort.",
    safety: "Use only your assigned tyre. Keep your lane clear and follow the marshal’s instructions."
  },
  {
    no: "06", title: "Slam Balls", tag: "POWER + COORDINATION", image: "slam-balls-lvl-up-branded-v1-black-lime",
    alt: "Children performing slam balls in individual marked bays at golden hour, with judges facing them and counting repetitions, spectators, flags and an event arch behind them.",
    description: "Complete 15 slam ball reps in your assigned spot. Stay in position throughout the exercise. Lift your ball overhead with both hands, slam it onto the ground in front of you, then pick it up with control. Finish all 15 reps before heading to the finish line.",
    steps: ["Wait for your station judge to assign your ball and marked spot.", "Lift the ball overhead with both hands, then slam it onto the ground in front of you.", "Bend your knees to collect the ball and repeat for 15 reps.", "After your station judge counts and confirms all 15 reps, continue to the finish line."],
    focus: "Full-body power, coordination and controlled effort over 15 reps.",
    safety: "Use only your assigned slam ball. Stay in your marked spot, keep the space in front of you clear and follow your station judge’s instructions."
  }
];

export type StationDetails = typeof stations[number] & { values:string[]; revision:number; updated:string };
export function stationImage(station:Pick<StationDetails,'image'>) {
 return station.image.startsWith('/media/') ? station.image : `/images/stations/${station.image}.webp?v=production-1`;
}
export function stationImageSet(station:Pick<StationDetails,'image'>) {
 return station.image.startsWith('/media/') ? undefined : `/images/stations/${station.image}-768.webp?v=production-1 768w, /images/stations/${station.image}.webp?v=production-1 1536w`;
}
