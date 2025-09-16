export const defaultConfig = {
  teams: [
    {
      name: "Team Alpha",
      members: "Alice, Bob, Charlie",
      color: "#FF6B6B",
      secret_code: "alpha2024"
    },
    {
      name: "Team Beta",
      members: "David, Eve, Frank",
      color: "#4ECDC4",
      secret_code: "beta2024"
    },
    {
      name: "Team Gamma",
      members: "Grace, Henry, Ivy",
      color: "#45B7D1",
      secret_code: "gamma2024"
    }
  ],
  challenges: [
    {
      name: "Speed Demon",
      description: "Complete a 10-mile ride in under 45 minutes. This challenge tests your speed and endurance on flat terrain.",
      pause_distance: true,
      latitude: 40.7128,
      longitude: -74.0060
    },
    {
      name: "Hill Climber",
      description: "Climb 2000 feet of elevation in a single ride. This challenge focuses on climbing ability and stamina.",
      pause_distance: true,
      latitude: 40.7589,
      longitude: -73.9851
    },
    {
      name: "Endurance Test",
      description: "Complete a 50-mile ride without stopping. This is the ultimate test of endurance and mental toughness.",
      pause_distance: true,
      latitude: 40.7505,
      longitude: -73.9934
    }
  ]
};