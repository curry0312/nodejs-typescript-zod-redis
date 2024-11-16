export function getKeyName(...args: string[]) {
  return `bites:${args.join(":")}`;
}

//getKeyName("cuisines", "f3few");
// output => bites:cuisines:f3few

export const getRestaurantKeyById = (id: string) =>
  getKeyName("restaurants", id);
