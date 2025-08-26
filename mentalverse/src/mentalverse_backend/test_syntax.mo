// Test file to validate MVT token syntax
import MVTToken "./mvt_token";

actor TestSyntax {
  // Test that the module compiles without errors
  public func test() : async Text {
    let _ = MVTToken.TOKEN_METADATA.name; // Use the import to avoid unused warning
    "MVT Token module syntax is valid"
  };
}