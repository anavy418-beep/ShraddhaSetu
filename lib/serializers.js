export function parseCSV(value) {
  if (!value) {
    return [];
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function serializeService(service) {
  return {
    ...service,
    image: service.image || "/images/puja-placeholder.jpg",
    language: parseCSV(service.languages),
    specialization: parseCSV(service.specialization)
  };
}
