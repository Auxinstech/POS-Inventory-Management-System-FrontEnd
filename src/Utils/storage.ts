
const set = (key: string, value: string) => {
    if (value) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };
  
  const get = (key: string) => {
    const value = localStorage.getItem(key);
  
    if (value) return JSON.parse(value);
  
    return undefined;
  };
  
  const remove = (key: string) => localStorage.removeItem(key);
  
  const clear = () => localStorage.clear();
  
  export default {
    set,
    get,
    remove,
    clear,
  };
  