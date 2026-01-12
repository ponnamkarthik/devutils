"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, Input } from "../components/UI";
import { MonacoEditor } from "../components/MonacoEditor";
import {
  Type,
  Database,
  RefreshCw,
  Copy,
  Check,
  FileText,
  Table,
  Download,
} from "lucide-react";
// @ts-ignore
import Papa from "papaparse";

const LOREM_WORDS = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "ut",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "ut",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "dolor",
  "in",
  "reprehenderit",
  "in",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "dolore",
  "eu",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "in",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
  "curabitur",
  "pretium",
  "tincidunt",
  "lacus",
  "nunc",
  "blandit",
  "fortis",
  "placitum",
];

const FIRST_NAMES = [
  "James",
  "Mary",
  "John",
  "Patricia",
  "Robert",
  "Jennifer",
  "Michael",
  "Linda",
  "William",
  "Elizabeth",
  "David",
  "Barbara",
  "Richard",
  "Susan",
  "Joseph",
  "Jessica",
  "Thomas",
  "Sarah",
  "Charles",
  "Karen",
  "Christopher",
  "Nancy",
  "Daniel",
  "Lisa",
  "Matthew",
  "Margaret",
  "Anthony",
  "Betty",
  "Mark",
  "Sandra",
  "Donald",
  "Ashley",
  "Steven",
  "Dorothy",
  "Paul",
  "Kimberly",
  "Andrew",
  "Emily",
  "Joshua",
  "Donna",
  "Kenneth",
  "Michelle",
  "Kevin",
  "Carol",
  "Brian",
  "Amanda",
  "George",
  "Melissa",
  "Timothy",
  "Deborah",
];
const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Jones",
  "Brown",
  "Davis",
  "Miller",
  "Wilson",
  "Moore",
  "Taylor",
  "Anderson",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Martin",
  "Thompson",
  "Garcia",
  "Martinez",
  "Robinson",
  "Clark",
  "Rodriguez",
  "Lewis",
  "Lee",
  "Walker",
  "Hall",
  "Allen",
  "Young",
  "Hernandez",
  "King",
  "Wright",
  "Lopez",
  "Hill",
  "Scott",
  "Green",
  "Adams",
  "Baker",
  "Gonzalez",
  "Nelson",
  "Carter",
  "Mitchell",
  "Perez",
  "Roberts",
  "Turner",
  "Phillips",
  "Campbell",
  "Parker",
  "Evans",
  "Edwards",
  "Collins",
];
const DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "example.com",
  "test.org",
  "company.net",
  "live.com",
];
const CITIES = [
  "New York",
  "London",
  "Paris",
  "Tokyo",
  "Sydney",
  "Berlin",
  "Toronto",
  "Singapore",
  "Dubai",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "San Jose",
];
const COUNTRIES = [
  "USA",
  "UK",
  "France",
  "Germany",
  "Japan",
  "Australia",
  "Canada",
  "Singapore",
  "UAE",
  "China",
  "India",
  "Brazil",
  "Mexico",
  "Italy",
  "Spain",
];
const JOB_TITLES = [
  "Software Engineer",
  "Product Manager",
  "Designer",
  "Data Scientist",
  "Marketing Manager",
  "Sales Representative",
  "HR Specialist",
  "Accountant",
  "Consultant",
  "CEO",
  "CTO",
  "Operations Manager",
  "Customer Support",
];

const ADJECTIVES = [
  "Ergonomic",
  "Rustic",
  "Intelligent",
  "Small",
  "Awesome",
  "Incredible",
  "Fantastic",
  "Practical",
  "Sleek",
  "Modern",
  "Durable",
  "Lightweight",
  "Premium",
  "Exclusive",
];
const MATERIALS = [
  "Steel",
  "Wooden",
  "Concrete",
  "Plastic",
  "Cotton",
  "Granite",
  "Rubber",
  "Leather",
  "Silk",
  "Wool",
  "Linen",
  "Marble",
  "Bronze",
  "Copper",
];
const PRODUCTS = [
  "Chair",
  "Car",
  "Computer",
  "Keyboard",
  "Mouse",
  "Bike",
  "Ball",
  "Gloves",
  "Pants",
  "Shirt",
  "Table",
  "Shoes",
  "Hat",
  "Towels",
  "Soap",
  "Tuna",
  "Chicken",
  "Fish",
  "Cheese",
  "Bacon",
];

const COMPANIES = [
  "Tech",
  "Soft",
  "Media",
  "Solutions",
  "Systems",
  "Global",
  "Data",
  "Connect",
  "Works",
  "Labs",
  "Industries",
  "Group",
  "Holdings",
  "Partners",
  "Ventures",
];
const SUFFIXES = [
  "Inc",
  "LLC",
  "Group",
  "Solutions",
  "Technologies",
  "Corp",
  "Ltd",
  "Co",
];

const rand = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const uuidv4 = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

const generateLorem = (
  count: number,
  type: "paragraphs" | "sentences" | "words",
  startWithLorem: boolean
) => {
  const getSentence = () => {
    const len = randInt(4, 15);
    const words = Array.from({ length: len }, () => rand(LOREM_WORDS));
    const sentence = words.join(" ");
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
  };

  const getParagraph = () => {
    const len = randInt(3, 8);
    return Array.from({ length: len }, getSentence).join(" ");
  };

  let result = "";

  if (type === "words") {
    const words = Array.from({ length: count }, () => rand(LOREM_WORDS));
    if (startWithLorem && count > 2) {
      words[0] = "lorem";
      words[1] = "ipsum";
    }
    result = words.join(" ");
  } else if (type === "sentences") {
    result = Array.from({ length: count }, getSentence).join(" ");
  } else {
    result = Array.from({ length: count }, getParagraph).join("\n\n");
  }

  if (
    startWithLorem &&
    type !== "words" &&
    !result.toLowerCase().startsWith("lorem ipsum")
  ) {
    result = "Lorem ipsum dolor sit amet. " + result;
  }

  return result;
};

const generateData = (count: number, type: "user" | "product" | "company") => {
  return Array.from({ length: count }, (_, i) => {
    if (type === "user") {
      const first = rand(FIRST_NAMES);
      const last = rand(LAST_NAMES);
      return {
        id: i + 1,
        uuid: uuidv4(),
        firstName: first,
        lastName: last,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@${rand(DOMAINS)}`,
        age: randInt(18, 80),
        jobTitle: rand(JOB_TITLES),
        address: {
          city: rand(CITIES),
          country: rand(COUNTRIES),
          zipCode: randInt(10000, 99999).toString(),
        },
        isActive: Math.random() > 0.2,
        createdAt: new Date(Date.now() - randInt(0, 10000000000)).toISOString(),
      };
    } else if (type === "product") {
      return {
        id: i + 1,
        sku: `${rand(LOREM_WORDS).toUpperCase()}-${randInt(100, 999)}`,
        name: `${rand(ADJECTIVES)} ${rand(MATERIALS)} ${rand(PRODUCTS)}`,
        price: parseFloat((Math.random() * 1000).toFixed(2)),
        currency: "USD",
        inStock: Math.random() > 0.1,
        rating: parseFloat((Math.random() * 5).toFixed(1)),
        categories: [rand(LOREM_WORDS), rand(LOREM_WORDS)],
      };
    } else if (type === "company") {
      return {
        id: i + 1,
        name: `${rand(COMPANIES)} ${rand(SUFFIXES)}`,
        industry: rand(JOB_TITLES).split(" ").pop(),
        founded: randInt(1950, 2023),
        employees: randInt(10, 50000),
        public: Math.random() > 0.5,
        website: `https://www.${rand(COMPANIES).toLowerCase()}${rand(SUFFIXES).toLowerCase()}.com`,
      };
    }
    return {};
  });
};

export const FakeDataTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"lorem" | "json">("json");
  const [output, setOutput] = useState("");

  // JSON Gen State
  const [jsonType, setJsonType] = useState<"user" | "product" | "company">(
    "user"
  );
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState<"json" | "csv">("json");

  // Lorem State
  const [loremType, setLoremType] = useState<
    "paragraphs" | "sentences" | "words"
  >("paragraphs");
  const [loremCount, setLoremCount] = useState(3);
  const [startLorem, setStartLorem] = useState(true);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, jsonType, count, format, loremType, loremCount, startLorem]);

  const generate = () => {
    if (activeTab === "lorem") {
      setOutput(generateLorem(loremCount, loremType, startLorem));
    } else {
      const data = generateData(count, jsonType);
      if (format === "json") {
        setOutput(JSON.stringify(data, null, 2));
      } else {
        setOutput(Papa.unparse(data));
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output], {
      type:
        activeTab === "json" && format === "json"
          ? "application/json"
          : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeTab === "lorem" ? "lorem.txt" : `fake_data.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-500/10 text-pink-500 rounded-lg">
            <Type className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Fake Data Generator
            </h1>
            <p className="text-xs text-muted-foreground">
              Generate Lorem Ipsum or structured mock data (JSON/CSV) for
              testing.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="flex justify-center pb-2 border-b border-border/40 mb-2">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setActiveTab("json")}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "json" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Database className="h-4 w-4" /> Structured Data
            </button>
            <button
              onClick={() => setActiveTab("lorem")}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "lorem" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <FileText className="h-4 w-4" /> Lorem Ipsum
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {activeTab === "json" ? (
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={jsonType}
                onChange={(e) => setJsonType(e.target.value as any)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="user">Users</option>
                <option value="product">Products</option>
                <option value="company">Companies</option>
              </select>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Count:</span>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  value={count}
                  onChange={(e) =>
                    setCount(
                      Math.min(1000, Math.max(1, parseInt(e.target.value) || 1))
                    )
                  }
                  className="w-20 h-9"
                />
              </div>

              <div className="flex bg-muted rounded-md p-1">
                <button
                  onClick={() => setFormat("json")}
                  className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${format === "json" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                >
                  JSON
                </button>
                <button
                  onClick={() => setFormat("csv")}
                  className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${format === "csv" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                >
                  CSV
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={loremType}
                onChange={(e) => setLoremType(e.target.value as any)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="paragraphs">Paragraphs</option>
                <option value="sentences">Sentences</option>
                <option value="words">Words</option>
              </select>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Count:</span>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={loremCount}
                  onChange={(e) =>
                    setLoremCount(
                      Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
                    )
                  }
                  className="w-20 h-9"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={startLorem}
                  onChange={(e) => setStartLorem(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                Start with "Lorem ipsum"
              </label>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button onClick={generate} size="sm">
              <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
            </Button>
            <Button
              onClick={handleDownload}
              variant="secondary"
              size="sm"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Output */}
      <Card className="flex-1 p-0 border-border/60 shadow-sm bg-card relative overflow-hidden flex flex-col">
        <MonacoEditor
          value={output}
          language={
            activeTab === "json" && format === "json" ? "json" : "plaintext"
          }
          readOnly
          lineNumbers={activeTab === "json" ? "on" : "off"}
          className="border-none"
          actions={
            <Button
              onClick={copyToClipboard}
              variant="ghost"
              size="sm"
              disabled={!output}
              className="h-6 px-2 text-xs hover:bg-background border border-transparent hover:border-border"
            >
              {copied ? (
                <Check className="h-3 w-3 mr-1 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          }
        />
      </Card>
    </div>
  );
};
