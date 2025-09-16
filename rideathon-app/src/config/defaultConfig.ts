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
      longitude: -74.0060,
      modifiers: [
        {
          multiplier: 1.2,
          creator_id: null, // System-generated modifier
          receiver_id: null, // Applies to all teams
          challenge_id: null, // Will be set when challenge is created
          start: null,
          end: null
        },
        {
          multiplier: 0.8,
          creator_id: null, // System-generated penalty modifier
          receiver_id: null, // Applies to all teams
          challenge_id: null,
          start: null,
          end: null
        }
      ],
      offsets: [
        {
          distance: 2.0,
          creator_id: null, // System-generated offset
          receiver_id: null, // Applies to all teams
          challenge_id: null
        }
      ],
      challenge_attempt_modifier: {
        multiplier: 1.1,
        creator_id: null, // System-generated attempt modifier
        receiver_id: null, // Applies to all teams
        challenge_id: null,
        start: null,
        end: null
      }
    },
    {
      name: "Hill Climber",
      description: "Climb 2000 feet of elevation in a single ride. This challenge focuses on climbing ability and stamina.",
      pause_distance: true,
      latitude: 40.7589,
      longitude: -73.9851,
      modifiers: [
        {
          multiplier: 1.5,
          creator_id: null, // System-generated bonus for elevation
          receiver_id: null,
          challenge_id: null,
          start: null,
          end: null
        },
        {
          multiplier: 0.9,
          creator_id: null, // System-generated penalty modifier
          receiver_id: null,
          challenge_id: null,
          start: null,
          end: null
        }
      ],
      offsets: [
        {
          distance: 5.0,
          creator_id: null, // System-generated offset for elevation challenge
          receiver_id: null,
          challenge_id: null
        }
      ],
      challenge_attempt_modifier: {
        multiplier: 1.3,
        creator_id: null, // System-generated attempt modifier for elevation
        receiver_id: null,
        challenge_id: null,
        start: null,
        end: null
      }
    },
    {
      name: "Endurance Test",
      description: "Complete a 50-mile ride without stopping. This is the ultimate test of endurance and mental toughness.",
      pause_distance: true,
      latitude: 40.7505,
      longitude: -73.9934,
      modifiers: [
        {
          multiplier: 2.0,
          creator_id: null, // System-generated high bonus for endurance
          receiver_id: null,
          challenge_id: null,
          start: null,
          end: null
        },
        {
          multiplier: 0.7,
          creator_id: null, // System-generated significant penalty modifier
          receiver_id: null,
          challenge_id: null,
          start: null,
          end: null
        }
      ],
      offsets: [
        {
          distance: 10.0,
          creator_id: null, // System-generated large offset for endurance challenge
          receiver_id: null,
          challenge_id: null
        }
      ],
      challenge_attempt_modifier: {
        multiplier: 1.6,
        creator_id: null, // System-generated attempt modifier for endurance
        receiver_id: null,
        challenge_id: null,
        start: null,
        end: null
      }
    }
  ]
};