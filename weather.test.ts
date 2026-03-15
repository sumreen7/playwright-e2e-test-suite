import { test, expect } from "@playwright/test";

const API_KEY = "b220dd67fdbd5e28296fbd2fc068bb37";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// Helper to build request URL
const weatherUrl = (city: string) =>
  `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;

// ─────────────────────────────────────────────
// Test 1: Valid city returns 200 and correct city name
// ─────────────────────────────────────────────
test("valid city returns 200 and correct city name", async ({ request }) => {
  const response = await request.get(weatherUrl("London"));

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.name).toBe("London");
});

// ─────────────────────────────────────────────
// Test 2: Invalid city returns 404
// ─────────────────────────────────────────────
test("invalid city returns 404", async ({ request }) => {
  const response = await request.get(weatherUrl("ThisCityDoesNotExist99999"));

  expect(response.status()).toBe(404);

  const body = await response.json();
  expect(body.message).toBe("city not found");
});

// ─────────────────────────────────────────────
// Test 3: Response schema contains required fields
// ─────────────────────────────────────────────
test("response schema contains required fields", async ({ request }) => {
  const response = await request.get(weatherUrl("Tokyo"));

  expect(response.status()).toBe(200);

  const body = await response.json();

  // Top-level fields
  expect(body).toHaveProperty("name");
  expect(body).toHaveProperty("weather");
  expect(body).toHaveProperty("main");
  expect(body).toHaveProperty("wind");
  expect(body).toHaveProperty("dt");

  // Nested: main block
  expect(body.main).toHaveProperty("temp");
  expect(body.main).toHaveProperty("humidity");
  expect(body.main).toHaveProperty("feels_like");
  expect(body.main).toHaveProperty("temp_min");
  expect(body.main).toHaveProperty("temp_max");

  // Nested: weather array
  expect(Array.isArray(body.weather)).toBe(true);
  expect(body.weather.length).toBeGreaterThan(0);
  expect(body.weather[0]).toHaveProperty("description");
  expect(body.weather[0]).toHaveProperty("main");
});

// ─────────────────────────────────────────────
// Test 4: Temperature is within a realistic range
// ─────────────────────────────────────────────
test("temperature is within realistic range (-100°C to 60°C)", async ({
  request,
}) => {
  const response = await request.get(weatherUrl("New York"));

  expect(response.status()).toBe(200);

  const body = await response.json();
  const temp = body.main.temp;

  expect(typeof temp).toBe("number");
  expect(temp).toBeGreaterThan(-100);
  expect(temp).toBeLessThan(60);
});

// ─────────────────────────────────────────────
// Test 5: Multiple cities return consistent schema
// ─────────────────────────────────────────────
const cities = ["Paris", "Sydney", "Mumbai"];

for (const city of cities) {
  test(`${city} returns consistent response schema`, async ({ request }) => {
    const response = await request.get(weatherUrl(city));

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body).toHaveProperty("name");
    expect(body).toHaveProperty("main");
    expect(body.main).toHaveProperty("temp");
    expect(body.main).toHaveProperty("humidity");
    expect(body).toHaveProperty("weather");
    expect(Array.isArray(body.weather)).toBe(true);
  });
}
