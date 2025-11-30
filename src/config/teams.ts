export interface TeamConfig {
  name: string
  slug: string
  logo: string
  primaryColor?: string
  secondaryColor?: string
}

export const TEAM_CONFIG = {
  bayfc: {
    name: 'Bay FC',
    slug: 'bayfc',
    logo: '/images/teams/bayfc.svg',
    primaryColor: '#00A3E0',
    secondaryColor: '#002D62',
  },
  valkyries: {
    name: 'Seattle Valkyries',
    slug: 'valkyries',
    logo: '/images/teams/valkyries.svg',
    primaryColor: '#862633',
    secondaryColor: '#FFB81C',
  },
} as const

export type TeamSlug = keyof typeof TEAM_CONFIG

export const TEAMS = Object.values(TEAM_CONFIG)

export function getTeamBySlug(slug: string): TeamConfig | undefined {
  return TEAM_CONFIG[slug as TeamSlug]
}
