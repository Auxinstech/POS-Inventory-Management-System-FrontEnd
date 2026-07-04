export default function isValidRoleOrPermission(input: string): boolean {
  const regex = /^[a-z]+([-_][a-z]+)*$/;
  return regex.test(input);
}
