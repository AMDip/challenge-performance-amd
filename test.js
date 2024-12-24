import http from 'k6/http';
import { check } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

const hostname = 'https://dummyjson.com';
let bearer;

export const options = {
    scenarios: {
      getToken: {
        executor: 'per-vu-iterations',
        exec: 'getToken',
        iterations: 1,
        tags: { my_custom_tag: 'getToken' },
      },
      apiTest1: {
        executor: 'constant-vus',
        exec: 'apiTest',
        vus: 50,
        duration: '60s',
        startTime: '2s',
        tags: { my_custom_tag: 'apiTest' },
      },
      apiTest2: {
        executor: 'constant-vus',
        exec: 'apiTest',
        vus: 100,
        duration: '60s',
        startTime: '2s',
        tags: { my_custom_tag: 'apiTest' },
      },
    },
  };

export function apiTest() {
    const title = uuidv4();
    const price = Math.floor(Math.random() * (1000 - 1 + 1) ) + 1;
    const data = { title: title, price: price };
    let response = http.post(`${hostname}/products/add`, JSON.stringify(data), 
    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearer}`} });
    check(response, {
        'is status 201': (r) => r.status === 201,
    });
}

export function getToken() {
    const data = { username: 'emilys', password: 'emilyspass' };
    let response = http.post(`${hostname}/auth/login`, JSON.stringify(data), 
    { headers: { 'Content-Type': 'application/json' }} );
    check(response, {
        'is status 200': (r) => r.status === 200,
    });
    const responseObj = response.json();
    bearer = responseObj.accessToken;
}

export function handleSummary(data) {
    return {
      "result.html": htmlReport(data),
      stdout: textSummary(data, { indent: " ", enableColors: true }),
    };
  }