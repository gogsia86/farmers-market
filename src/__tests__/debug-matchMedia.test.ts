/**
 * @fileoverview Diagnostic Test - matchMedia Mock Investigation
 * @module __tests__/debug-matchMedia
 * @description Deep dive investigation into why matchMedia mock isn't working
 *
 * This test file helps us understand:
 * 1. When is window.matchMedia available?
 * 2. Is our mock being applied?
 * 3. Is Jest clearing our mock?
 * 4. What is the actual state of window.matchMedia during tests?
 */

describe("🔬 matchMedia Mock Diagnostics", () => {
  beforeAll(() => {
    console.log("\n🔍 === BEFORE ALL TESTS ===");
    console.log("typeof window:", typeof window);
    console.log("typeof window.matchMedia:", typeof window.matchMedia);
    console.log("window.matchMedia:", window.matchMedia);

    if (typeof window.matchMedia === "function") {
      const result = window.matchMedia("(prefers-reduced-motion: reduce)");
      console.log("matchMedia result:", result);
      console.log("matchMedia result type:", typeof result);
      console.log("result.matches:", result?.matches);
    }
  });

  beforeEach(() => {
    console.log("\n🔍 === BEFORE EACH TEST ===");
    console.log("typeof window.matchMedia:", typeof window.matchMedia);
    console.log("window.matchMedia:", window.matchMedia);

    if (typeof window.matchMedia === "function") {
      const result = window.matchMedia("(prefers-reduced-motion: reduce)");
      console.log("matchMedia result:", result);
      console.log("matchMedia result is null?", result === null);
      console.log("matchMedia result is undefined?", result === undefined);
    }
  });

  it("should have window object available", () => {
    expect(typeof window).toBe("object");
    expect(window).toBeDefined();
  });

  it("should have matchMedia function on window", () => {
    console.log("\n🧪 TEST: matchMedia function exists");
    console.log("window.matchMedia:", window.matchMedia);
    console.log("typeof window.matchMedia:", typeof window.matchMedia);

    expect(window.matchMedia).toBeDefined();
    expect(typeof window.matchMedia).toBe("function");
  });

  it("should return MediaQueryList when calling matchMedia", () => {
    console.log("\n🧪 TEST: matchMedia returns MediaQueryList");

    const result = window.matchMedia("(prefers-reduced-motion: reduce)");

    console.log("result:", result);
    console.log("typeof result:", typeof result);
    console.log("result === null:", result === null);
    console.log("result === undefined:", result === undefined);

    expect(result).toBeDefined();
    expect(result).not.toBeNull();
    expect(typeof result).toBe("object");
  });

  it("should have matches property on MediaQueryList", () => {
    console.log("\n🧪 TEST: MediaQueryList has matches property");

    const result = window.matchMedia("(prefers-reduced-motion: reduce)");

    console.log("result:", result);
    console.log("result.matches:", result?.matches);
    console.log("typeof result.matches:", typeof result?.matches);

    expect(result).toBeDefined();
    expect(result).toHaveProperty("matches");
    expect(typeof result.matches).toBe("boolean");
  });

  it("should have media property on MediaQueryList", () => {
    console.log("\n🧪 TEST: MediaQueryList has media property");

    const result = window.matchMedia("(prefers-reduced-motion: reduce)");

    console.log("result.media:", result?.media);

    expect(result).toHaveProperty("media");
    expect(result.media).toBe("(prefers-reduced-motion: reduce)");
  });

  it("should have addEventListener on MediaQueryList", () => {
    console.log("\n🧪 TEST: MediaQueryList has addEventListener");

    const result = window.matchMedia("(prefers-reduced-motion: reduce)");

    console.log("result.addEventListener:", result?.addEventListener);
    console.log(
      "typeof result.addEventListener:",
      typeof result?.addEventListener,
    );

    expect(result).toHaveProperty("addEventListener");
    expect(typeof result.addEventListener).toBe("function");
  });

  it("should have removeEventListener on MediaQueryList", () => {
    console.log("\n🧪 TEST: MediaQueryList has removeEventListener");

    const result = window.matchMedia("(prefers-reduced-motion: reduce)");

    expect(result).toHaveProperty("removeEventListener");
    expect(typeof result.removeEventListener).toBe("function");
  });

  it("should persist mock across multiple calls", () => {
    console.log("\n🧪 TEST: Mock persists across calls");

    const result1 = window.matchMedia("(prefers-reduced-motion: reduce)");
    const result2 = window.matchMedia("(prefers-reduced-motion: reduce)");
    const result3 = window.matchMedia("(min-width: 768px)");

    console.log("result1:", result1);
    console.log("result2:", result2);
    console.log("result3:", result3);

    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
    expect(result3).toBeDefined();

    expect(result1.matches).toBe(false);
    expect(result2.matches).toBe(false);
    expect(result3.matches).toBe(false);
  });

  it("should work when called inside useEffect simulation", () => {
    console.log("\n🧪 TEST: matchMedia in useEffect simulation");

    // Simulate what happens in useReducedMotion hook
    let capturedMatches: boolean | undefined;

    const simulateUseEffect = () => {
      if (typeof window === "undefined") {
        console.log("❌ window is undefined");
        return;
      }

      console.log("✅ window is defined");
      console.log("typeof window.matchMedia:", typeof window.matchMedia);

      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

      console.log("mediaQuery:", mediaQuery);
      console.log("mediaQuery is null?", mediaQuery === null);
      console.log("mediaQuery is undefined?", mediaQuery === undefined);
      console.log("mediaQuery.matches:", mediaQuery?.matches);

      if (mediaQuery) {
        capturedMatches = mediaQuery.matches;
      }
    };

    simulateUseEffect();

    expect(capturedMatches).toBeDefined();
    expect(typeof capturedMatches).toBe("boolean");
  });

  it("should allow mock configuration", () => {
    console.log("\n🧪 TEST: Can configure mock");

    // Try to reconfigure the mock
    const mockMatchMedia = jest.fn().mockImplementation((query) => ({
      matches: true, // Different from default false
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: mockMatchMedia,
    });

    const result = window.matchMedia("(prefers-reduced-motion: reduce)");

    console.log("Custom mock result:", result);
    console.log("Custom mock result.matches:", result.matches);

    expect(result.matches).toBe(true);
    expect(mockMatchMedia).toHaveBeenCalledWith(
      "(prefers-reduced-motion: reduce)",
    );
  });

  it("should check if Jest is clearing mocks between tests", () => {
    console.log("\n🧪 TEST: Jest mock clearing behavior");
    console.log(
      "jest.isMockFunction(window.matchMedia):",
      jest.isMockFunction(window.matchMedia),
    );

    if (jest.isMockFunction(window.matchMedia)) {
      console.log("✅ matchMedia is a Jest mock function");
      console.log(
        "Mock calls:",
        (window.matchMedia as jest.Mock).mock.calls.length,
      );
    } else {
      console.log("❌ matchMedia is NOT a Jest mock function");
    }
  });

  afterEach(() => {
    console.log("\n🔍 === AFTER EACH TEST ===");
    console.log("typeof window.matchMedia:", typeof window.matchMedia);
  });

  afterAll(() => {
    console.log("\n🔍 === AFTER ALL TESTS ===");
    console.log("typeof window.matchMedia:", typeof window.matchMedia);
  });
});

describe("🔬 Global vs Window Comparison", () => {
  it("should compare global.matchMedia vs window.matchMedia", () => {
    console.log("\n🧪 TEST: global vs window");
    console.log("typeof global.matchMedia:", typeof (global as any).matchMedia);
    console.log("typeof window.matchMedia:", typeof window.matchMedia);
    console.log(
      "Are they the same?",
      (global as any).matchMedia === window.matchMedia,
    );

    if (typeof (global as any).matchMedia === "function") {
      const globalResult = (global as any).matchMedia("test");
      console.log("global.matchMedia result:", globalResult);
    }

    if (typeof window.matchMedia === "function") {
      const windowResult = window.matchMedia("test");
      console.log("window.matchMedia result:", windowResult);
    }
  });
});

describe("🔬 jsdom Environment Check", () => {
  it("should verify jsdom is being used", () => {
    console.log("\n🧪 TEST: jsdom environment verification");
    console.log("navigator.userAgent:", navigator.userAgent);
    console.log("window.location.href:", window.location.href);
    console.log("document.documentElement:", document.documentElement?.tagName);

    // jsdom sets a specific user agent
    expect(navigator.userAgent).toContain("jsdom");
  });

  it("should check what jsdom provides by default", () => {
    console.log("\n🧪 TEST: jsdom default APIs");
    console.log("window.fetch:", typeof window.fetch);
    console.log("window.localStorage:", typeof window.localStorage);
    console.log("window.sessionStorage:", typeof window.sessionStorage);
    console.log("window.matchMedia:", typeof window.matchMedia);
    console.log(
      "window.IntersectionObserver:",
      typeof window.IntersectionObserver,
    );
    console.log("window.ResizeObserver:", typeof window.ResizeObserver);
  });
});
