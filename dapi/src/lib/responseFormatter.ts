export interface IAbiMethodInputOrOutput {
  name: string;
  type: string;
  components?: Array<{ name: string; type: string }>;
}
