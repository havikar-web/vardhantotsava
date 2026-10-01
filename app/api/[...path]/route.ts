import { handleNextRequest } from '../../../server/next-handler.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const GET=handleNextRequest;
export const POST=handleNextRequest;
export const PUT=handleNextRequest;
export const DELETE=handleNextRequest;
