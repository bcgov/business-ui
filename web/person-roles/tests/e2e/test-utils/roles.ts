export function getRandomRoles() {
  const roles = [
    'Chief Executive Officer',
    'Treasurer',
    'Chief Financial Officer',
    'Secretary',
    'President',
    'Assistant Secretary',
    'Vice President',
    'Other Office(s)',
    'Chair'
  ]

  const randomCount = Math.floor(Math.random() * roles.length) + 1

  return [...roles].sort(() => 0.5 - Math.random()).slice(0, randomCount)
}
