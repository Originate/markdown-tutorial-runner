// Signals to the type checker that not using the given variables is okay here
export default function pretendToUse(...obj: Array<any>) {
  obj.toString()
}
