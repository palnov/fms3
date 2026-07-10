import fs from "fs";
import os from "os";
import path from "path";
import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";
import { clearKnowledgeCacheForTests, retrieveKnowledge } from "@/lib/knowledge-repository";

const tempDirs: string[] = [];

afterEach(() => {
  clearKnowledgeCacheForTests();
  delete process.env.KNOWLEDGE_DB_PATH;
  tempDirs.splice(0).forEach((directory) => fs.rmSync(directory, { recursive: true, force: true }));
});

describe("knowledge retrieval", () => {
  it("ranks chunks and matches templates without sorting the full result set", () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "fms3-knowledge-"));
    tempDirs.push(directory);
    const dbPath = path.join(directory, "knowledge.db");
    const db = new Database(dbPath);
    db.exec("CREATE TABLE chunks (id INTEGER, content TEXT, source_file TEXT, embedding TEXT, source_url TEXT, local_download_url TEXT); CREATE TABLE templates (id TEXT, title TEXT, file_path TEXT, sample_path TEXT, keywords TEXT);");
    db.prepare("INSERT INTO chunks VALUES (?, ?, ?, ?, ?, ?)").run(1, "РВП по браку", "law.txt", JSON.stringify([1, 0]), null, null);
    db.prepare("INSERT INTO chunks VALUES (?, ?, ?, ?, ?, ?)").run(2, "Патент", "patent.txt", JSON.stringify([0, 1]), null, null);
    db.prepare("INSERT INTO templates VALUES (?, ?, ?, ?, ?)").run("rvp", "Заявление РВП", "/blank.docx", "/sample.pdf", "рвп, заявление");
    db.close();
    process.env.KNOWLEDGE_DB_PATH = dbPath;

    const result = retrieveKnowledge([1, 0], "нужно заявление на рвп", 1, 0.1);
    expect(result.chunks.map((chunk) => chunk.source_file)).toEqual(["law.txt"]);
    expect(result.templates.map((template) => template.id)).toEqual(["rvp"]);
  });
});
