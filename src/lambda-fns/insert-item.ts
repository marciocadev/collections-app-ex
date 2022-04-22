export const handler = async(event: any) => {
  console.log(event);
  event.dev = true;
  return {event};
};