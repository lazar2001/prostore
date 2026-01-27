import { clsx, type ClassValue } from "clsx"
import { log } from "console";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert prisma object into a regular JSON object
export function convertToPlainObject<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

// Format number with decimal places
export function formatNumberWithDecimal(num:number): string {
  const [int,decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2,'0')}` : `${int}.00`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function formatError(error:any){
  if(error.name==="ZodError"){
    const fieldErrors = Object.keys(error.issues).map((field)=>error.issues[field].message);
    return fieldErrors.join(". ");
  }
  else if(error.name === "PrismaClientKnownRequestError" && error.code === "P2002"){
    console.log(error);
    const field = error.meta?.target ? error.meta.target[0] : "Email";
    
    return `The ${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please choose a different one.`;
  }
  else{
    return typeof error.message === "string" ? error.message : "An unexpected error occurred. Please try again.";
  }
}

export function roundToTwoDecimalPlaces(value: number | string) : number {
  if (typeof value === "number"){
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }else if(typeof value === "string"){
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }
  else{
    throw new Error("Value is not a number or string");
  }
}