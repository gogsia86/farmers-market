/**
 * Global sharp mock for all tests
 * Prevents native compilation issues
 */

const sharp = jest.fn(() => ({
  resize: jest.fn().mockReturnThis(),
  toFormat: jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockResolvedValue(Buffer.from("mocked_image")),
  toFile: jest.fn().mockResolvedValue({ size: 1024 }),
  metadata: jest.fn().mockResolvedValue({
    width: 800,
    height: 600,
    format: "jpeg",
  }),
}));

export default sharp;
