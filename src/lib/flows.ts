/**
 * The data flow of each data engineering build, stage by stage. Every stage
 * restates a line of the project's own write-up (src/data/projects.json);
 * nothing here adds a claim the project page does not make.
 */
export type Stage = { step: string; label: string; note: string; icon: string }
export type Flow = { title: string; stages: Stage[] }

export const FLOWS: Record<string, Flow> = {
  "weather-api": {
    title: "Weather text in, search by meaning out",
    stages: [
      { step: "Source", label: "National Weather Service API", note: "Alerts and forecasts, no API key", icon: "ui-cloud-sun" },
      { step: "Normalise", label: "Python harvester", note: "One document record per item", icon: "python" },
      { step: "Store", label: "Lakebase PostgreSQL", note: "Raw JSON kept for provenance", icon: "postgres" },
      { step: "Embed", label: "all-MiniLM-L6-v2", note: "384-dimension pgvector columns", icon: "hugging-face" },
      { step: "Serve", label: "Flask REST API", note: "Sync and semantic search", icon: "flask" },
    ],
  },
  "rag-bot": {
    title: "Paper records to grounded answers",
    stages: [
      { step: "Source", label: "Research-paper metadata", note: "10M+ entries", icon: "ui-database" },
      { step: "Ingest", label: "Ingestion pipeline", note: "Preprocessing time down 40%", icon: "python" },
      { step: "Transform", label: "Clean, chunk, vectorise", note: "The ETL step", icon: "ui-layers" },
      { step: "Store", label: "Qdrant", note: "Vector retrieval, queries 50% faster", icon: "qdrant" },
      { step: "Answer", label: "LLM", note: "Grounded in the retrieved papers", icon: "ui-bot" },
    ],
  },
  ticketing: {
    title: "A data app with no stored password",
    stages: [
      { step: "Interface", label: "Streamlit on Databricks Apps", note: "Filters, search and validation", icon: "streamlit" },
      { step: "Auth", label: "OAuth token per connection", note: "Refreshed 5 minutes before expiry", icon: "ui-plug" },
      { step: "Access", label: "SQLAlchemy and psycopg", note: "Pooled connections", icon: "python" },
      { step: "Store", label: "Lakebase Postgres", note: "Tickets, messages, status history", icon: "databricks" },
    ],
  },
  "job-copilot": {
    title: "Three job APIs to a ranked shortlist",
    stages: [
      { step: "Sources", label: "Adzuna, USAJobs, RemoteOK", note: "Job postings", icon: "ui-briefcase" },
      { step: "Store", label: "Lakebase data model", note: "Profiles, jobs, applications", icon: "databricks" },
      { step: "Retrieve", label: "Semantic retrieval", note: "Job descriptions against the resume", icon: "ui-layers" },
      { step: "Rank", label: "LLM agent", note: "Skills, role, location, constraints", icon: "ui-bot" },
      { step: "Track", label: "Application pipeline", note: "Stages moved by the agent", icon: "ui-chart-line" },
    ],
  },
  blunderchess: {
    title: "A move in, a graded move out",
    stages: [
      { step: "Client", label: "Browser and chess.js", note: "The rules of the game", icon: "javascript" },
      { step: "Server", label: "Express", note: "Serves the static front end", icon: "express" },
      { step: "Queue", label: "One serialised job queue", note: "Move search and analysis", icon: "ui-layers" },
      { step: "Engine", label: "Stockfish 18 (WASM)", note: "Runs in-process", icon: "ui-cpu" },
      { step: "Grade", label: "Centipawn loss", note: "Five bands, great to blunder", icon: "ui-crown" },
    ],
  },
  "sales-dashboard": {
    title: "Sales records to $400K+ of fixes",
    stages: [
      { step: "Source", label: "E-commerce sales data", note: "5,009 orders, 793 customers", icon: "ui-database" },
      { step: "Prepare", label: "SQL and Advanced Excel", note: "Prepared and checked", icon: "postgres" },
      { step: "Model", label: "Tableau KPIs", note: "Date, category and region filters", icon: "tableau" },
      { step: "Visualise", label: "Six linked views", note: "Profit, returns, map, segments", icon: "tableau" },
      { step: "Act", label: "Recommendations", note: "$400K+ a year identified", icon: "ui-chart-line" },
    ],
  },
}
