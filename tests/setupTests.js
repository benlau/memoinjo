import fetchMock from "jest-fetch-mock";
import $ from "../bower_components/jquery/dist/jquery.min.js";

fetchMock.enableMocks();
global.$ = $;
