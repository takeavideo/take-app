const guardedTerms = /\b(whatsapp|whats|instagram|insta|telegram|pix)\b/i;
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const handlePattern = /(^|\s)@[A-Z0-9._]{3,}/i;

export const contactGuardMessage =
  'Para sua segurança, mantenha toda a comunicação e contratação dentro do TAKE.';

export function containsExternalContact(value: string) {
  const message = value.trim();
  const digits = message.replace(/\D/g, '');

  return (
    emailPattern.test(message) ||
    guardedTerms.test(message) ||
    handlePattern.test(message) ||
    digits.length >= 10
  );
}
