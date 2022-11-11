declare module "array-keyed-map" {
  class ArrayKeyedMap<K extends unknown[], V> extends Map<K, V> {}
  export default ArrayKeyedMap;
}
