declare module Chai {
  interface Assertion
    extends LanguageChains,
      NumericComparison,
      TypeComparison {
    bignumber: Assertion;
  }
}
