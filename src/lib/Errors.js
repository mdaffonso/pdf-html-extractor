export class NotPrivacyPolicy extends Error {
  constructor(message) {
    super(message)
    if (!message) this.message = "The file doesn't seem to be a Privacy Policy."
    this.name = 'NotPrivacyPolicy'
  }
}