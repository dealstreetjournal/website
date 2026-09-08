import { useState, useEffect, useRef, useCallback, Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FaSearch, FaTimes, FaRobot, FaChartBar, FaLightbulb,
  FaArrowUp, FaArrowDown, FaMinus, FaFilePdf, FaBuilding,
  FaHistory, FaBars, FaTrash, FaChartPie, FaUsers, FaHandshake,
  FaMoneyBillWave, FaChartLine, FaDownload, FaTable,
  FaExclamationTriangle, FaChevronRight, FaExpandAlt, FaCompressAlt,
  FaPlus, FaUser, FaArrowLeft, FaCopy, FaCheck, FaSignOutAlt, FaPen,
} from 'react-icons/fa'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)
import { useAuth } from '../hooks/useAuth'
import {
  aiFreeSearch, getAiHistory, getAiHistoryDetail,
  deleteAiHistoryItem, clearAiHistory, getAiSuggestions,
} from '../api/aiSearchApi'
import config from '../config'
import CopyButton from '../components/CopyButton'
import { userData } from '../api/userApi'
import { logout as logoutApi } from '../api/authApi'

// ── Number formatter for chart axes ──────────────────────────────────────────
// Source workbooks store every figure in INR THOUSANDS (e.g. raw Share Capital "500" =
// 50,000 shares x Rs 10 face value = Rs 5 lakh) — chart data (revenueChart, profitChart,
// tableData, etc.) carries these raw values straight through, so convert to actual
// rupees here before applying the Lakh/Crore thresholds. This mirrors the same fix in
// the backend's fmt() — without it, chart tooltips/axes would show figures 1000x too
// small relative to the pre-formatted insight/summary text.
// Always Millions — regardless of magnitude, every currency figure across the page (stat
// cards, charts, comparison tables, YoY tables) renders in this one consistent unit instead
// of switching between Lakh/Crore (or raw thousands) depending on size.
// 2 decimal places — matches the backend's OWN canonical formatter (fmtMn() in
// AiSearchService.java, %.2f) exactly. Found live: the same figure was showing as 25.66mn in
// one place and 26mn in another — a real inconsistency. This frontend copy used only 1
// decimal place, so the SAME figure showed as "₹5014.77 Mn" in a backend-pre-formatted
// keyMetrics value but "₹5,014.8 Mn" wherever this function formatted the raw chart/table
// value right next to it on the same card — same number, visibly different precision.
// Multiplier FROM Millions (fmtMn's own existing "raw/1000 = Mn" baseline) TO each unit the
// backend's currencyUnit field can send — e.g. 1 Mn = 10 Lakh, 1 Mn = 0.1 Cr — mirrors
// AiSearchService's UnitPref exactly — extending
// the "in crore"/"in lakh"/etc. query-requested-unit feature to the chart/table numbers too,
// not just the headline/insight text the backend itself formats).
const MN_TO_UNIT_MULTIPLIER = { Mn: 1, Thousand: 1000, Hundred: 10000, Lakh: 10, Cr: 0.1, Bn: 0.001 }
// unit defaults to 'Mn' so every EXISTING call site (which never passed one) keeps behaving
// exactly as before — only call sites that explicitly have a turn's own result.currencyUnit in
// scope pass it through.
const fmtMn = (v, unit = 'Mn') => {
  if (v == null || v === 0) return `₹0.00 ${unit}`
  const millions = Math.abs(v) / 1000
  const scaled = millions * (MN_TO_UNIT_MULTIPLIER[unit] ?? 1)
  const sign = v < 0 ? '-₹' : '₹'
  return sign + scaled.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + unit
}

// ── Full financial statement helpers (Balance Sheet / P&L / Cash Flow) ───────
// Backend rows are {label, isHeader, values} in exact Excel order. isHeader rows
// (e.g. "Shareholders' Funds", "Non-Current Liabilities") carry no values — they
// only exist to caption the rows that follow, up to the next header.

const groupStatementRows = (rows) => {
  const groups = []
  let current = null
  rows.forEach(row => {
    if (row.isHeader) {
      current = { header: row, items: [] }
      groups.push(current)
    } else {
      if (!current) { current = { header: null, items: [] }; groups.push(current) }
      current.items.push(row)
    }
  })
  return groups
}

// Rows whose values are NOT a rupee amount — ratios, multiples, percentages, counts, and
// month-durations — must stay as plain numbers, not get divided into Millions like every
// other row in the same table.
// Word-bounded (\b) — found live: plain .includes('ratio') also matched inside "Director
// RemuneRATIOn", wrongly treating it as a non-currency ratio row and skipping the Million
// conversion. Whole-word checks avoid this whole class of hidden-substring false positive.
// Deliberately no "/months]" check — a row like "Monthly cash sales ₹ [(vi)=(v)/Months]"
// divides BY a month-count in its formula, but the RESULT is still a rupee amount; only
// "in months" (the row's own unit being a duration, e.g. "Runway (In months)") disqualifies it.
const NON_CURRENCY_ROW_RE = /\b(ratio|multiple|metrics|turnover|headcount)\b|%|number of|in months/i
const isNonCurrencyStatementRow = (label) => NON_CURRENCY_ROW_RE.test(label || '')

// Values are raw INR thousands (same convention as chart data). Currency rows convert to
// Millions — same unit as every stat card/chart on the page — with parentheses for
// negatives; ratio/multiple/count/month-duration rows stay as plain Indian-grouped numbers
// since they were never a rupee amount to begin with.
const fmtStatementNum = (v, label, unit = 'Mn') => {
  if (v == null || v === 0) return '—'
  if (isNonCurrencyStatementRow(label)) {
    const isInt = Number.isInteger(v)
    const formatted = Math.abs(v).toLocaleString('en-IN', { minimumFractionDigits: isInt ? 0 : 2, maximumFractionDigits: 2 })
    return v < 0 ? `(${formatted})` : formatted
  }
  // 2 decimal places — matches fmtMn() above and the backend's own canonical formatter
  // exactly. Found live: the same figure was showing as 25.66mn in one place and 26mn in
  // another — a real inconsistency. This Balance Sheet/P&L/Cash Flow statement table was its own separate
  // 1-decimal formatter, so the exact same row's value could round differently here than in
  // the keyMetrics tile or singleMetricChart table showing the same figure elsewhere on the
  // page. unit defaults to 'Mn' (see fmtMn's own comment) — StatementBlock passes its
  // currencyUnit prop through when the query asked for a different one.
  const scaled = (Math.abs(v) / 1000) * (MN_TO_UNIT_MULTIPLIER[unit] ?? 1)
  const formatted = scaled.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + unit
  return v < 0 ? `(${formatted})` : formatted
}

const cleanStatementLabel = (label) => {
  let cleaned = (label || '').trim().replace(/\s+/g, ' ')
  // Cash Flow section headers arrive as "A|Cash flow from Operating Activities"
  // (serial marker + caption from the source Excel) — render as "A. Cash flow...".
  const piped = cleaned.match(/^([A-Za-z0-9]+)\|(.+)$/)
  if (piped) cleaned = `${piped[1]}. ${piped[2].trim()}`
  return cleaned.startsWith('-') ? cleaned.slice(1).trim() : cleaned
}

const isStatementTotalRow = (label) => /^total\b/i.test(cleanStatementLabel(label))

// A search counts as "financial statement" mode either via the Report Type
// selector (lastSearchedTypes) or by typing the words for it directly — which
// includes the exact keyword string the "Financial Statements" Analyze button
// itself searches with ("revenue profit financial overview balance sheet",
// see REPORT_TYPES below), not just the literal phrase "financial statement".
const isFinancialStatementSearch = (query, lastSearchedTypes) => {
  if (lastSearchedTypes?.length > 0) return lastSearchedTypes.includes('financialStatements')
  const q = (query || '').toLowerCase().trim()
  if (!q) return false
  if (/financial statements?/.test(q)) return true
  // "financials" alone — a common shorthand for "financial statements", still not handled here. The backend's
  // own isFinancialStatementQuery already treats bare "financial" as enough and returns the
  // same 3-statement data either way — this frontend copy just hadn't caught up, so
  // "financials" was showing the Company Overview dashboard around the statements instead of
  // just the statements themselves.
  // Bare "financial" (no "s") now matches too — explicit parity with "financials" was
  // requested, overriding the earlier deliberate
  // exclusion here). Backend payload was already byte-for-byte identical either way; only this
  // frontend copy still drew a line between them, so "Astrotalk financial 2023-24" fell through
  // to the broader Company Overview treatment while "financials" got the narrow statements-only
  // view — same data, visibly different page. The false-positive risk this exclusion originally
  // guarded against ("financial year," "financial health") is the same tradeoff the backend's
  // own check already accepts, so matching it here is consistent, not a new risk.
  if (/\bfinancials?\b/.test(q)) return true
  // Naming one specific statement by name — "balance sheet", "profit and loss"/"p&l",
  // "cash flow statement" — also counts, same narrow treatment as "financial statement(s)"
  // itself. Found live: asking for just the balance sheet was
  // rendering the full Company Overview/Key Highlights dashboard around it instead of just
  // the statement table, because only the literal phrase "financial statement(s)" was
  // recognized here — a plain "balance sheet" (or its resubmitted "balance sheet in
  // <year>" form, from answering the year-selection prompt) fell through to the general
  // treatment even though the backend itself already narrows its OWN response for this
  // exact case (AiSearchService's own singleStatementTopic/narrowTopicMode).
  if (/\bbalance sheet\b/.test(q)) return true
  if (/\bprofit\s*(?:(?:and|&)\s*loss|\/\s*loss)\b|\bp\s*&\s*l\b/.test(q)) return true
  if (/\bcash flow(?:\s+statement)?\b/.test(q)) return true
  // Match the Analyze button's keyword set by word, not as one exact contiguous
  // phrase — the company name can land anywhere in the typed query, and words
  // may come in any order, so an exact-substring check missed real variants.
  const buttonWords = (REPORT_TYPES.find(r => r.id === 'financialStatements')?.query || '')
    .toLowerCase().split(' ').filter(Boolean)
  return buttonWords.length > 0 && buttonWords.every(w => q.includes(w))
}

// Matches a BARE year answer to a "which year?" prompt — "2024-25", "FY 2024-25",
// a plain "2024", or "all"/"all years" — and nothing else. Used to detect when the
// user typed only the year (no company name, since the search box is intentionally
// left empty after a year prompt) so doSearch can stitch it back onto that prompt's
// own company + question before actually searching.
const isBareYearAnswer = (q) => /^(fy\s*)?\d{4}(\s*-\s*\d{2,4})?$/i.test(q.trim()) || /^all(\s+years?)?$/i.test(q.trim())

// A reply to the "which years should I compare" range prompt can name several years or a
// range ("2022-23 to 2024-25", "2022-23, 2023-24") — isBareYearAnswer only recognizes one.
const isYearRangeAnswer = (q) => {
  const trimmed = q.trim()
  if (isBareYearAnswer(trimmed)) return true
  const tokens = trimmed.match(/\b(?:fy\s*)?\d{4}(?:\s*-\s*\d{2,4})?\b/gi) || []
  return tokens.length >= 2
}

// A stitched-together query lands in front of TWO different backend year-detectors that
// don't agree on syntax: plain statement/data lookups accept a bare trailing year fine, but
// the custom-calculation engine (AiCalcEngine, for ratio/chain-style asks like "X divided by
// Y") only recognizes a year preceded by "in"/"for"/"during" — a bare trailing year there is
// silently ignored and every operand falls back to its most-recent-year value instead. Found
// live: answering a "which year?" prompt with just "2021-22" after a ratio-style question
// picked FY2024-25's numbers instead, with no visible year anywhere in the answer. Prepending
// "in " before a REAL year (not "all"/"all years", which isn't a year at all) satisfies both
// detectors at once and is a no-op for the plain-lookup path either way.
const withYearPreposition = (q) => /^all(\s+years?)?$/i.test(q.trim()) ? q : `in ${q}`

// A bare "carry on with what we were just looking at" word — "detail", "more",
// "expand", ... — with no topic of its own. Typed alone, this doesn't fail as
// "not found" (there's no company name needed for the backend to return SOME
// answer), it just silently falls back to a generic Company Overview instead of
// digging into whatever was actually being discussed (e.g. asking "detail" right
// after a financial statement search should deepen THAT, not switch topics) — so
// unlike isBareYearAnswer's failed-search retry, this has to be caught upfront and
// stitched onto the previous turn's own company + query before ever searching.
const isGenericContinuation = (q) =>
  /^(detail|details|more|more\s+detail|more\s+details|full\s+detail|full\s+details|show\s+(me\s+)?(the\s+)?detail|show\s+(me\s+)?more|tell\s+me\s+more|expand|elaborate)s?$/i.test(q.trim())

// "Compare with the previous year"/"vs last year"/"year over year" typed as a follow-up,
// naming neither a company nor a metric of its own — the backend has no notion of
// "conversation state" at all (see aiSearchApi.js: every request is a single stateless
// {query} string), so left as typed this fails company resolution outright the same way
// any other bare follow-up would. Rewritten below to the carried-forward company + topic,
// PLUS "latest year" (not "all years" — see that stitch's own comment for why) -- every
// multi-year answer already carries an automatic year-over-year insight line comparing
// the latest year to its own immediate previous one, so this is what actually satisfies
// "compare with the previous year" using paths that already work, rather than a real
// "just these two years" comparison feature this project doesn't have.
const isPreviousYearComparisonAnswer = (q) =>
  /\b(vs\.?|versus|compare[ds]?\s*(with|to)?)\s*(the\s*)?(previous|last|prior)\s*year\b/i.test(q.trim())
  || /\byear[\s-]?over[\s-]?year\b/i.test(q.trim()) || /\byoy\b/i.test(q.trim())

// Strips an already-baked-in "FY 2023-24"/"in 2023-24" (or bare "2023-24") from a
// carried-forward topic string before stitching on a NEW bare-year (or "all") answer —
// otherwise re-attaching a previous turn's own query verbatim would combine an old
// specific year with the new one (or with "all"), asking for both at once instead of
// letting the new answer actually replace it. Strips the "in"/"for"/"during" preposition
// along with the year (see withYearPreposition) so a leftover bare "in"/"for" doesn't sit
// dangling in front of whatever gets appended next.
const stripYearFromQuery = (q) => (q || '')
  .replace(/\b(?:in|for|during)\s+(?:fy\s*)?\d{4}\s*-\s*\d{2,4}\b|\b(?:in|for|during)\s+fy\s*\d{4}\b/gi, '')
  .replace(/\b(fy\s*)?\d{4}\s*-\s*\d{2,4}\b|\bfy\s*\d{4}\b/gi, '')
  .replace(/\s+/g, ' ').trim()

// ── Company Overview data extraction ──────────────────────────────────────
// Everything here is pulled from data that already exists elsewhere in the
// response (balance sheet rows, ratios table, burn/ads metrics, RPT table) —
// nothing new except adsMetricsChart, which the backend now also exposes.

const findStatementRow = (rows, predicate) =>
  (rows || []).find(r => !r.isHeader && predicate(cleanStatementLabel(r.label)))

const findChartRow = (rows, predicate) => (rows || []).find(r => predicate(r.label))

const latestArrValue = (arr) => (Array.isArray(arr) && arr.length ? arr[arr.length - 1] : null)

// ── Single-metric focus mode (EBIT / any specific named line item) ──
// EBIT is detected straight from the query text, not the backend's intent
// classifier — it lumps EBIT into the same "ebitda" bucket, which was showing
// EBITDA's data when someone specifically asked for EBIT. Bare "EBITDA" is
// deliberately NOT force-matched here (only EBIT is) — found live: "EBITDA
// details"/"EBITDA detail" forced this same narrow chart-only view, hiding the
// full dashboard (P&L table, margin table, summary) the backend already sends
// correctly for a plain EBITDA query — EBITDA doesn't have the EBIT ambiguity
// problem this list exists for, so it doesn't need forcing here at all. Every
// other named line item (Gross Margin, Rent, Dividend Received, ...) is
// detected via the backend's own `focusedMetric` flag, set whenever it matched
// the query to one specific Excel row — it also sends that row's own FY-by-FY
// series as chartData.singleMetricChart so a trend chart can be drawn for it.
const SINGLE_METRIC_MATCHERS = [
  { mode: 'ebit', test: /\bebit\b/i },
]

const detectSingleMetricMode = (query, result) => {
  // Backend's own row match wins when it exists — it's authoritative about WHICH row the
  // query actually resolved to. Found live: "EBITDA margin analysis" matches the EBITDA
  // Margin (%) row (data lands in chartData.singleMetricChart), but the regex below still
  // fired on the word "ebitda" in the query text and forced the raw-EBITDA renderer, which
  // reads a different chart key (chartData.ebitdaChart) that specificItemMode never
  // populates — rendering an empty/wrong chart instead of the matched row's real data.
  if (result?.focusedMetric && result?.chartData?.singleMetricChart?.length > 0) return 'generic'
  const q = (query || '').toLowerCase()
  const hit = SINGLE_METRIC_MATCHERS.find(m => m.test.test(q))
  if (hit) return hit.mode
  return null
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getSingleMetricConfig = (mode, result) => {
  const cd = result.chartData || {}
  if (mode === 'ebit') {
    // No dedicated EBIT series exists — derive it as EBITDA minus Depreciation &
    // Amortisation, matching the same "EBIT [(xi)=(ix)-(x)]" formula the backend
    // uses for the keyMetrics tile.
    const deprRow = findStatementRow(cd.profitLossStatement, l => /depreciation.*amorti[sz]ation/i.test(l))
    const series = (cd.ebitdaChart || []).map((d, i) => {
      const depr = deprRow?.values?.[i]
      return (d.value != null && depr != null) ? { year: d.year, value: d.value - depr } : null
    }).filter(Boolean)
    return { labelTest: /^ebit\b/i, title: 'EBIT', accent: '#6366f1', fmt: (v) => fmtMn(v, result.currencyUnit), isCurrency: true, series }
  }
  if (mode === 'generic') {
    const series = cd.singleMetricChart || []
    if (!series.length) return null
    // Prefer the backend's own record of which row it matched (focusedMetricLabel) over
    // keyMetrics[0] — keyMetrics is a same-topic bucket fetched independently of the one
    // row specificItem actually matched (e.g. a "EBITDA Margin (%)" search still fills
    // keyMetrics with the plain "EBITDA" row first), so titling from it could name a
    // different row than the one this chart's data (singleMetricChart) actually plots.
    const rawLabel = result.focusedMetricLabel || (result.keyMetrics || [])[0]?.label
    if (!rawLabel) return null
    const cleanTitle = rawLabel
      .replace(/\s*\[[^\]]*\]\s*/g, ' ')
      .replace(/\s*\(\d{4}-\d{2,4}\)\s*$/, '')
      .replace(/\s+/g, ' ')
      .trim()
    // A matched row like "EBITDA Margin (%)" holds a percentage, not a currency amount —
    // formatting it with fmtMn (₹ Mn) would print something like "-₹21.20 Mn" for a -21.2%
    // margin. Format as a percentage whenever the row's own (uncleaned) label says so.
    const isPercent = /%/.test(rawLabel)
    return {
      labelTest: new RegExp('^' + escapeRegex(cleanTitle || 'x'), 'i'),
      title: cleanTitle || 'Value', accent: '#8b5cf6',
      // Same raw-ratio-needs-×100 fix as FocusedMetricTurn's own yFmt above — this series'
      // values are the same unscaled chartData.singleMetricChart numbers.
      fmt: isPercent ? (v) => `${(v * 100).toFixed(1)}%` : (v) => fmtMn(v, result.currencyUnit),
      isCurrency: !isPercent,
      series,
    }
  }
  return null
}

// ratiosTable / rptTable values are pipe-joined across years ("0.74|0.47") when
// the source sheet has multiple financial years — take the most recent one.
const latestPipeNum = (str) => {
  if (!str) return null
  const parts = String(str).split('|')
  const n = parseFloat(parts[parts.length - 1])
  return Number.isFinite(n) ? n : null
}

// Full FY-by-FY series (not just latest) for a named ratio, as a percentage —
// used to give "Financials at a Glance" the same YoY treatment as every other
// row instead of only the Overview's latest-year snapshot.
const findRatioSeries = (ratiosTable, name, years) => {
  const row = (ratiosTable || []).find(r => (r.name || '').trim().toLowerCase() === name.toLowerCase())
  if (!row?.value) return years.map(() => null)
  const parts = String(row.value).split('|')
  return years.map((_, i) => {
    const n = parseFloat(parts[i])
    return Number.isFinite(n) ? n * 100 : null
  })
}

// One entry per CONSECUTIVE year pair — empty when fewer than 2 years are present (nothing
// to compare a single year against), one entry for 2 years, N-1 entries for N years. Never a
// single first-vs-last change over the whole span, which would compound multiple years of
// growth into one misleading number.
const buildYoySeries = (rawValues) => {
  const series = []
  for (let i = 1; i < rawValues.length; i++) {
    const prev = rawValues[i - 1], cur = rawValues[i]
    if (prev != null && cur != null && prev !== 0) {
      const pct = (cur - prev) / Math.abs(prev) * 100
      series.push({ yoy: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`, yoyPositive: pct >= 0 })
    } else {
      series.push({ yoy: 'N/A', yoyPositive: null })
    }
  }
  return series
}

// revenueSeries (optional, same length/order as rawValues) computes each year's % of
// Revenue from the company's own Revenue figures — never a fixed/assumed ratio. Omitted
// entirely for rows that are already a percentage (margins/ratios), since dividing a %
// by Revenue again would be meaningless.
const buildYoyRow = (label, rawValues, formatFn, revenueSeries) => {
  if (!rawValues.some(v => v != null)) return null
  const pctOfRevenue = revenueSeries
    ? rawValues.map((v, i) => {
        const rev = revenueSeries[i]
        return (v != null && rev != null && rev !== 0) ? `${(v / rev * 100).toFixed(1)}%` : null
      })
    : null
  return { label, values: rawValues.map(v => (v == null ? '—' : formatFn(v))), yoySeries: buildYoySeries(rawValues), pctOfRevenue }
}

// Extra rows for "Financials at a Glance" — the same underlying data as the
// Company Overview stat tiles, but shown FY-by-FY with YoY like every other
// row in this table, instead of Overview's latest-year-only snapshot.
const buildExtraGlanceRows = (result) => {
  const cd    = result.chartData || {}
  const years = result.financialYears || []
  if (!years.length) return []

  const totalLiabRow = findStatementRow(cd.balanceSheetStatement, l => /^total liabilities/i.test(l))
  const shareCapRow  = findStatementRow(cd.balanceSheetStatement, l => /^share capital$/i.test(l))
  const reservesRow  = findStatementRow(cd.balanceSheetStatement, l => /^reserves and surplus$/i.test(l))
  const ocfRow       = findStatementRow(cd.cashFlowStatement, l => /^net cash generated.*operating/i.test(l))
  const burnRow      = findChartRow(cd.burnMetricsChart, l => /gross burn rate/i.test(l) && /total|annual/i.test(l))
  const adsRow       = findChartRow(cd.adsMetricsChart,  l => /advertisement.*expense/i.test(l))
  const marginByYear = Object.fromEntries((cd.marginChart || []).map(d => [String(d.year), d]))

  const seriesFromStatementRow = (row) => years.map((_, i) => row.values?.[i] ?? null)
  const seriesFromChartRow     = (row) => years.map(y => (typeof row[y] === 'number' ? row[y] : null))
  const revenueSeries = years.map(y => {
    const found = (cd.revenueChart || []).find(d => String(d.year) === String(y))
    return found ? found.value : null
  })

  const pctRow = (label, values) => buildYoyRow(label, values, v => `${v.toFixed(1)}%`)
  const curRow = (label, values) => buildYoyRow(label, values, (v) => fmtMn(v, result.currencyUnit), revenueSeries)

  return [
    totalLiabRow && curRow('Total Liabilities',    seriesFromStatementRow(totalLiabRow)),
    shareCapRow  && curRow('Share Capital',        seriesFromStatementRow(shareCapRow)),
    reservesRow  && curRow('Reserves & Surplus',   seriesFromStatementRow(reservesRow)),
    pctRow('Gross Margin',  years.map(y => marginByYear[y]?.grossMargin  ?? null)),
    pctRow('EBITDA Margin', years.map(y => marginByYear[y]?.ebitdaMargin ?? null)),
    ocfRow && curRow('Cash Flow from Operations', seriesFromStatementRow(ocfRow)),
    pctRow('ROE',  findRatioSeries(cd.ratiosTable, 'ROE',  years)),
    pctRow('ROIC', findRatioSeries(cd.ratiosTable, 'ROIC', years)),
    pctRow('ROCE', findRatioSeries(cd.ratiosTable, 'ROCE', years)),
    burnRow && curRow('Annual Gross Burn Rate', seriesFromChartRow(burnRow)),
    adsRow  && curRow('Advertisement Cost', seriesFromChartRow(adsRow)),
  ].filter(Boolean)
}

// Module-level (not React state) — every live TypewriterText instance on the page claims
// and releases one "typing in progress" slot here as it starts/finishes, regardless of
// which turn/component it's nested in. AiSearchPage subscribes to this to know when it's
// safe to accept the NEXT query — see that subscription below for why.
let _activeTyperCount = 0
const _typingListeners = new Set()
const _beginTypingActivity = () => { _activeTyperCount++; _typingListeners.forEach(fn => fn(_activeTyperCount)) }
const _endTypingActivity = () => { _activeTyperCount = Math.max(0, _activeTyperCount - 1); _typingListeners.forEach(fn => fn(_activeTyperCount)) }

// Reveals AI-written text a character at a time — used for the summary paragraph and the
// year-selection question, so those read as the AI actively composing its answer rather
// than a static block of text just popping in fully-formed. Re-types from scratch whenever
// `text` itself changes (a new search result / a new question), not on every re-render.
// `instant` skips the character-by-character animation entirely and shows the full text
// right away — used when a turn is being RESTORED from history:
// re-opening a saved conversation replayed the same "typing" effect that plays for a live,
// just-arrived answer, making already-known saved text look like it's arriving fresh again).
// `start` gates when typing may begin — pass false to hold a block back until an earlier
// one finishes, and `onDone` to advance to the next block, so a card's summary/computedFrom/
// notes type one after another instead of all animating in parallel.
const TypewriterText = ({ text, speed = 20, instant = false, start = true, onDone }) => {
  const [shown, setShown] = useState(instant ? (text || '') : '')
  const firedRef = useRef(false)
  const activeRef = useRef(false) // whether THIS instance currently holds a claimed typing slot
  useEffect(() => {
    const claim = () => { if (!activeRef.current) { activeRef.current = true; _beginTypingActivity() } }
    const release = () => { if (activeRef.current) { activeRef.current = false; _endTypingActivity() } }

    if (instant) {
      setShown(text || '')
      release()
      if (!firedRef.current) { firedRef.current = true; onDone && onDone() }
      return
    }
    if (!start) { setShown(''); release(); return }
    firedRef.current = false
    setShown('')
    if (!text) { release(); firedRef.current = true; onDone && onDone(); return }
    claim()
    let i = 0
    const id = setInterval(() => {
      i++
      setShown(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        release()
        if (!firedRef.current) { firedRef.current = true; onDone && onDone() }
      }
    }, speed)
    return () => { clearInterval(id); release() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, instant, start])
  return shown
}

// Drives a sequence of TypewriterText blocks so each one only starts once the previous
// finishes — the "stage" a card has revealed up to. `instant` (restoring from history)
// unlocks every stage immediately so nothing waits on the animation.
const useTypeSequence = (instant) => {
  const [stage, setStage] = useState(instant ? Infinity : 0)
  useEffect(() => { if (instant) setStage(Infinity) }, [instant])
  const advance = (n) => () => setStage((s) => (s === n ? n + 1 : s))
  const startAt = (n) => stage >= n
  return { startAt, advance }
}

// `delay` staggers each card's fade/rise-in (see the aiRevealIn keyframe rendered by
// whichever section uses these) so a stat grid builds itself up card by card instead of
// the whole block just appearing at once — reads as the AI assembling the answer.
const OverviewStat = ({ label, value, delay = 0 }) => (
  <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5"
    style={{ animation: 'aiRevealIn 0.4s ease-out both', animationDelay: `${delay}s` }}>
    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</p>
    <p className="text-sm font-bold text-gray-900 mt-0.5">{value}</p>
  </div>
)

// One statement (Balance Sheet / P&L / Cash Flow) as bold-heading accordion groups —
// expanded by default so every line is visible with no clicking — click a
// heading only if you want to collapse that section.
const StatementBlock = (props) => {
  const { title, accent, Icon, rows, activeIdxs, visibleYrs, statementKey, openGroups, onToggle, currencyUnit = 'Mn' } = props
  const groups = groupStatementRows(rows)
  // Some schedules (e.g. Other Expenses, Employee Expenses) are only itemised in the source
  // Excel for a subset of the company's financial years — every line-item row's values array
  // then falls short of the full year count. The backend backfills what it safely can for
  // those trailing years (the row's own "Total", plus any individual row independently
  // verified against another section like Burn Metrics) — so by the time this renders, some
  // non-Total rows may have all years and others may not. Use the MINIMUM length among
  // non-Total rows (not the max) so the note still fires as long as AT LEAST ONE row is still
  // incomplete, rather than disappearing the moment any single row gets backfilled.
  const nonTotalRows = rows.filter(r => !r.isHeader && !/^total\b/i.test(r.label || ''))
  const maxLenAll      = Math.max(0, ...rows.filter(r => !r.isHeader).map(r => r.values?.length || 0))
  const minLenNonTotal = nonTotalRows.length > 0 ? Math.min(...nonTotalRows.map(r => r.values?.length || 0)) : maxLenAll
  const noDataYrs = activeIdxs
    .map((idx, pos) => (idx >= maxLenAll ? visibleYrs[pos] : null))
    .filter(Boolean)
  const totalOnlyYrs = nonTotalRows.length > 0 ? activeIdxs
    .map((idx, pos) => (idx >= minLenNonTotal && idx < maxLenAll ? visibleYrs[pos] : null))
    .filter(Boolean) : []
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      style={{ animation: 'aiRevealIn 0.4s ease-out both' }}>
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg,${accent},${accent}55)` }} />
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <Icon className="text-xs" style={{ color: accent }} />
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: accent }}>{title}</p>
      </div>
      {noDataYrs.length > 0 && (
        <div className="mx-2 mb-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg text-[10px] text-amber-700">
          Source Excel has no data here for: {noDataYrs.map(y => `FY ${y}`).join(', ')}
        </div>
      )}
      {totalOnlyYrs.length > 0 && (
        <div className="mx-2 mb-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg text-[10px] text-amber-700">
Some items aren't itemised in the source Excel for {totalOnlyYrs.map(y => `FY ${y}`).join(', ')} (shown as —) — Total for {totalOnlyYrs.length > 1 ? 'those years is' : 'that year is'} still shown, reconciled from the company's overall figures.
        </div>
      )}
      <div className="px-2 pb-3 overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2.5 px-4 min-w-[180px] text-[10px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">Particulars</th>
              {visibleYrs.map(yr => (
                <th key={yr} className="text-right py-2.5 px-4 min-w-[110px] text-[10px] font-bold text-gray-400 uppercase whitespace-nowrap">FY {yr}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g, gi) => {
              const key = `${statementKey}-${gi}`
              const hasItems = g.items.length > 0
              const isOpen = hasItems && openGroups[key] !== false
              return (
                <Fragment key={gi}>
                  {g.header && (
                    <tr onClick={() => hasItems && onToggle(key)}
                      className={`bg-gray-50/80 ${hasItems ? 'cursor-pointer hover:bg-orange-50/60' : ''}`}>
                      <td colSpan={visibleYrs.length + 1} className="py-3 px-4 text-[11px] font-black text-gray-800">
                        <span className="inline-flex items-center gap-1.5">
                          {hasItems && (
                            <FaChevronRight className={`text-[9px] text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                          )}
                          {cleanStatementLabel(g.header.label)}
                        </span>
                      </td>
                    </tr>
                  )}
                  {(!g.header || isOpen) && g.items.map((row, ri) => {
                    const isTotal = isStatementTotalRow(row.label)
                    const indent = g.header ? 'pl-6' : 'pl-2'
                    // row.yoySeries[a] is the pair between full-year-list indices a and a+1 —
                    // only usable for a visible column pair when those two indices are still
                    // adjacent (no year toggled off between them), same convention as the
                    // Financials at a Glance table. Shown stacked inside that column's own
                    // value cell (below "% of Rev") rather than as its own separate column —
                    // keeps the table to one column per FY instead of doubling width.
                    const yoyPairForCol = (k) => {
                      const a = activeIdxs[k], b = activeIdxs[k + 1]
                      return b === a + 1 ? row.yoySeries?.[a] : null
                    }
                    return (
                      <tr key={ri} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className={`py-2.5 px-4 min-w-[180px] whitespace-nowrap ${indent} text-gray-700 ${isTotal ? 'font-bold text-gray-900' : ''}`}>
                          {cleanStatementLabel(row.label)}
                        </td>
                        {activeIdxs.map((j, k) => {
                          const pair = k > 0 ? yoyPairForCol(k - 1) : null
                          return (
                            <td key={j} className={`text-right py-2.5 px-4 min-w-[110px] whitespace-nowrap tabular-nums ${isTotal ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                              {fmtStatementNum(row.values?.[j], row.label, currencyUnit)}
                              <span className={`block w-fit ml-auto px-1.5 py-0.5 rounded-md text-[9px] font-black mt-1 ${!pair ? 'invisible' :
                                  pair.yoyPositive === true  ? 'bg-green-50 text-green-700'
                                : pair.yoyPositive === false ? 'bg-red-50 text-red-600'
                                : 'bg-gray-50 text-gray-400'
                                }`}>{pair ? `${pair.yoy} YoY` : '—'}</span>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Shared chart options ──────────────────────────────────────────────────────

// pctFn(rawValue, xAxisLabel) is optional — when given, the tooltip shows the value's
// % of Revenue as a second line underneath the main figure (null/undefined return means
// no second line, e.g. Revenue itself has no separate base to divide by that isn't itself).
const barOpts = (yFmt, pctFn) => ({
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (c) => {
      const main = ' ' + (yFmt ? yFmt(c.raw) : c.raw)
      const pct = pctFn ? pctFn(c.raw, c.label) : null
      return pct ? [main, ` ${pct} of Revenue`] : main
    } } },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#9ca3af' } },
    y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 }, color: '#9ca3af', callback: yFmt || ((v) => v) } },
  },
})

const lineOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { font: { size: 10 }, color: '#6b7280', boxWidth: 10, padding: 8 } },
    tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${c.raw}%` } },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#9ca3af' } },
    y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 }, color: '#9ca3af', callback: (v) => v + '%' } },
  },
}

const doughnutOpts = (unit = 'Mn') => ({
  responsive: true, maintainAspectRatio: false,
  cutout: '62%',
  plugins: {
    legend: { position: 'bottom', labels: { font: { size: 10 }, color: '#6b7280', boxWidth: 10, padding: 6 } },
    tooltip: { callbacks: { label: (c) => ` ${c.label}: ${fmtMn(c.raw, unit)}` } },
  },
})


// ── Report types (matches changes.png) ───────────────────────────────────────

const REPORT_TYPES = [
  { id: 'financialStatements', label: 'Financial',            sub: 'P&L · Balance Sheet · Cash Flow',  Icon: FaTable,         query: 'revenue profit financial overview balance sheet' },
  { id: 'capTable',            label: 'Cap Table',            sub: 'Shareholding · Promoters · FII',   Icon: FaUsers,         query: 'shareholders cap table promoter shareholding equity' },
  { id: 'rpt',                 label: 'Related Parties',      sub: 'Transactions · Associates',         Icon: FaHandshake,     query: 'related party transactions rpt' },
  { id: 'overheadCosts',       label: 'Overhead Costs',       sub: 'EBITDA · Expenses · Burn Rate',    Icon: FaMoneyBillWave, query: 'ebitda overhead costs expenses depreciation burn rate' },
  { id: 'investorMetrics',     label: 'Investor Metrics',     sub: 'ROE · ROA · ROCE · Ratios',        Icon: FaChartLine,     query: 'investor metrics roe roa roce return ratios' },
]

const PDF_LABELS = {
  financialStatements: 'Financial',
  overheadCosts:       'Overhead Costs',
  capTable:            'Cap Table',
  rpt:                 'RPT',
  investorMetrics:     'Investor Metrics',
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Written the way an assistant would narrate its own thinking, not a database/ETL pipeline
// ("scanning", "extracting records") — found live: that phrasing read as a mechanical data
// pull rather than an AI actually reasoning about the question, on every single search.
const THINKING_STEPS = [
  'Looking into the numbers...',
  'Reading through the financials...',
  'Working out the key metrics...',
  'Spotting the trends that matter...',
  'Putting it all together...',
]

// ── Date helpers ──────────────────────────────────────────────────────────────

const dateLabel = (iso) => {
  if (!iso) return 'Earlier'
  const diff = Math.floor((Date.now() - new Date(iso)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff <= 7)  return 'This Week'
  return 'Earlier'
}

// Grouped/labeled by LAST ACTIVITY (updatedAt), not when the conversation first started
// (createdAt) — continuing a 3-day-old conversation today moves it into "Today", same as
// ChatGPT/Claude's own history list. Falls back to createdAt for older rows saved before
// updatedAt existed.
const groupHistory = (list) => {
  const g = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] }
  list.forEach(item => { const k = dateLabel(item.updatedAt || item.createdAt); if (g[k]) g[k].push(item) })
  return g
}

const timeAgo = (iso) => {
  if (!iso) return ''
  const s = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (s < 60)    return 'just now'
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
// ── Conversation turns ──────────────────────────────────────────────────────
// One "turn" = one user question + the AI's response to it. The page renders an
// ordered array of these (see `turns` state in AiSearchPage) so older turns stay
// fully visible and independently interactive after newer ones are appended,
// ChatGPT/Claude-style, instead of the AI's answer replacing the previous one.

// `onEdit` (when given) loads this exact text back into the bottom composer for editing —
// a typo, or just wanting to ask it differently, shouldn't require retyping the whole thing
// from scratch — a past search should be editable and resubmittable. Deliberately does NOT resubmit on its own — it hands the
// text back to the composer so the user can change it first, same as clicking an autocomplete
// suggestion does (pickSuggestion), just seeded from a past question instead of a company name.
const UserBubble = ({ text, onEdit }) => (
  <div className="flex justify-end group">
    <div className="max-w-[85%] flex items-center gap-1.5">
      {onEdit && (
        <button
          onClick={() => onEdit(text)}
          title="Edit and re-ask"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex-shrink-0">
          <FaPen className="text-[10px]" />
        </button>
      )}
      <div className="bg-gray-100 text-gray-900 text-sm rounded-2xl rounded-tr-md px-4 py-2.5">
        {text}
      </div>
    </div>
  </div>
)

// Stagger the answer's own major sections (header, key metrics, overview,
// statements, highlights, ...) so the whole turn reads as being assembled
// progressively — ChatGPT/Claude-style "filling in" — instead of popping in
// as one flat block. Reuses the same `aiRevealIn` keyframe (index.css) the
// rest of this page already uses for finer per-item staggering, just at a
// coarser per-section delay.
const Reveal = ({ index = 0, children }) => (
  <div style={{ animation: 'aiRevealIn 0.5s ease-out both', animationDelay: `${index * 0.15}s` }}>
    {children}
  </div>
)

const ThinkingBubble = ({ step }) => (
              <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                <div className="flex justify-center gap-1.5 mb-5">
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#ff7010]"
                      style={{ animation:'aiPulse 1.2s ease-in-out infinite', animationDelay:`${i*0.18}s` }} />
                  ))}
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">{THINKING_STEPS[step]}</p>
                <style>{`@keyframes aiPulse{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1.3);opacity:1}}`}</style>
              </div>
)

// Same assistant-card shell (avatar circle + TypewriterText) every other turn kind uses —
// this used to be a plain static red box that skipped the typing effect entirely, the one
// card on the page that didn't match how every other response renders.
const ErrorTurn = ({ message, instant = false }) => (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100/60 px-6 py-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center flex-shrink-0">
                    <FaBuilding className="text-red-500 text-xs" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 mb-0.5">Not found</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <TypewriterText instant={instant} text={message} />
                    </p>
                  </div>
                </div>
              </div>
)

const YearPromptTurn = ({ result, instant = false }) => (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100/60 px-6 py-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center flex-shrink-0">
                    <FaRobot className="text-[#ff7010] text-xs" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <TypewriterText instant={instant} text={
                        `Sure, let's look at ${result.companyName || ''}'s ${result.query || ''}. ` +
                        `Which year should I focus on — ${(result.availableYears || []).join(', ')} — or would you like to see all of them?`
                      } />
                    </p>
                  </div>
                </div>
              </div>
)

// A requested year that isn't one of this company's own recorded years (a typo like
// "2024-24", or simply a real year the company has no data for) — flags the mismatch,
// then offers the closest real year on record as a one-click follow-up instead of
// silently falling back to showing every year, or answering with nothing at all.
const YearCorrectionTurn = ({ result, onFollowUp, instant = false }) => {
  const { startAt, advance } = useTypeSequence(instant)
  const line1 = `Data for ${result.requestedYear || 'that year'} is not available`
    + (result.companyName ? ` for ${result.companyName}` : '') + '.'
  const line2 = result.yearIsMalformed
    ? `"${result.requestedYear}" isn't a valid financial year — the financial year you're asking for is incorrect.`
    : `The financial year you're asking for isn't one this company has data for.`
  const line3 = result.suggestedYear
    ? `We have data for the financial year ${result.suggestedYear}. Do you want to see that data?`
    : null
  return (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100/60 px-6 py-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center flex-shrink-0">
                    <FaRobot className="text-[#ff7010] text-xs" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <TypewriterText instant={instant} text={line1} start={startAt(0)} onDone={advance(0)} />
                    </p>
                    {startAt(1) && (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <TypewriterText instant={instant} text={line2} start={startAt(1)} onDone={advance(1)} />
                      </p>
                    )}
                    {line3 && startAt(2) && (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <TypewriterText instant={instant} text={line3} start={startAt(2)} onDone={advance(2)} />
                      </p>
                    )}
                    {line3 && startAt(3) && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => onFollowUp?.(result.correctedQuery || `${result.query || ''} ${result.suggestedYear}`.trim())}
                          className="px-3 py-1.5 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-[#ff7010] text-xs font-semibold transition-colors">
                          Yes, show FY {result.suggestedYear}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
  )
}

// Companies being compared don't all have the same financial years on record — asks
// which years to use instead of silently blending mismatched years into one table.
const YearRangePromptTurn = ({ result, instant = false }) => (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100/60 px-6 py-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center flex-shrink-0">
                    <FaRobot className="text-[#ff7010] text-xs" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">
                      <TypewriterText instant={instant} text={
                        `${result.companyName || 'These companies'} don't have the same years on record. ` +
                        `Which years should I compare?`
                      } />
                    </p>
                    <div className="space-y-1 mb-2">
                      {(result.companyYearRanges || []).map((cy, i) => (
                        <p key={i} className="text-xs text-gray-500">
                          <span className="font-semibold text-gray-700">{cy.companyName}:</span>{' '}
                          {(cy.availableYears || []).join(', ') || '—'}
                        </p>
                      ))}
                    </div>
                    {result.commonYears?.length > 0 && (
                      <p className="text-xs text-gray-400">
                        Common years: {result.commonYears.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
)

// Pure term-definition answer ("explain EBITDA", "what is current ratio") — no company data at
// all, so it deliberately skips the whole AssistantAnswerTurn dashboard (hero header, charts,
// statements) and just shows the term + its plain-English definition. Also doubles as the
// "vague ask" rescue card ("what is this", bare "which"/"who"/"that") via result.glossaryHelp —
// a short list of clickable example questions instead of a dead-end error.
const GlossaryTurn = ({ result, onFollowUp, instant = false }) => (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100/60 px-6 py-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center flex-shrink-0">
                    <FaLightbulb className="text-[#ff7010] text-xs" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {result.glossaryHelp ? (
                      <>
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                          <TypewriterText instant={instant} text={result.message || ''} />
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(result.examples || []).map((ex, i) => (
                            <button
                              key={i}
                              onClick={() => onFollowUp?.(ex)}
                              className="px-3 py-1.5 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-[#ff7010] text-xs font-semibold transition-colors">
                              {ex}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-gray-800 mb-1.5">{result.term}</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          <TypewriterText instant={instant} text={result.definition || ''} />
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
)

// Red for a loss/negative figure, green for a gain/positive one, plain dark gray for exactly
// zero or a non-numeric-looking string — the standard finance-app convention, applied by just
// reading the leading "-" off the already-formatted display string (fmt/fmtMn/percent strings
// all consistently put the sign there) rather than needing the raw number passed around too.
const valueColor = (displayValue) => {
  const s = String(displayValue ?? '')
  if (/^-/.test(s.replace(/^[₹\s]+/, ''))) return 'text-red-600'
  if (/^[₹]?0(\.0+)?\s*(mn|%|x)?$/i.test(s.replace(/,/g, '').trim())) return 'text-gray-900'
  return 'text-emerald-600'
}

// Small YoY trend pill — reads the backend's own `trend` field ("up"/"down"/"stable"), already
// computed for every keyMetrics entry but previously never shown anywhere on this simplified
// card. Renders nothing for "stable"/missing rather than a neutral dash, since a flat trend on
// a single-year figure isn't informative enough to be worth a badge.
const TrendBadge = ({ trend }) => {
  if (trend !== 'up' && trend !== 'down') return null
  const isUp = trend === 'up'
  const Icon = isUp ? FaArrowUp : FaArrowDown
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${isUp ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
      <Icon className="text-[9px]" /> YoY
    </span>
  )
}

// Strips the "[(ix)=(i)-(iv)]"-style Excel formula noise and a trailing "(2023-24)" year
// suffix from a keyMetrics label — same cleanup AssistantAnswerTurn's own key-metrics strip
// already does, duplicated here (not shared) since it's two lines and this component doesn't
// otherwise depend on that file's local render-scope state.
const cleanMetricLabel = (label) =>
  (label || '').replace(/\s*\[[^\]]*\]\s*/g, ' ').replace(/\s*\(\d{4}-\d{2,4}\)\s*$/, '')

// Removes every "(...)" group, NESTED ones included, by tracking paren depth rather than a
// single regex pass — found live: the naive `\([^)]*\)` regex used
// for a calculated-answer's title stops at the FIRST ")" it sees, so a label containing a
// nested pair (e.g. AiCalcEngine's own "Net Burn (Annual) (recalculated — source Excel's own
// "Net burn rate (Monthly)" value differed)") only ever strips up to that inner ")", leaving a
// garbled fragment like 'Net Burn" value differed)' behind instead of the clean "Net Burn"
// title every other calculated answer shows.
const stripAllParens = (s) => {
  let out = ''
  let depth = 0
  for (const ch of s) {
    if (ch === '(') { depth++; continue }
    if (ch === ')') { if (depth > 0) depth--; continue }
    if (depth === 0) out += ch
  }
  return out.replace(/\s+/g, ' ').trim()
}

// One polished table used everywhere a small year-wise/breakdown table shows up on this page
// (FocusedMetricTurn's trend table, its "detail" breakdown, aiCalculation's perYear/detail/
// compare tables) — previously each of those hand-rolled its own <table>, some with a proper
// dark header bar and some with none at all, so the SAME kind of data looked different from
// one card to the next — one consistent, presentable table, with its own copy button so the numbers can be
// pasted straight into Excel/Sheets). Copies as tab-separated text — that's what a spreadsheet
// paste expects — not a visually-formatted copy.
const SimpleTable = ({ headers, rows }) => {
  const tsv = [headers.join('\t'), ...rows.map(r => [r.label, ...r.cells].join('\t'))].join('\n')
  return (
    <div className="mt-3">
      <div className="flex justify-end mb-1">
        <CopyButton text={tsv} className="text-gray-300 hover:text-gray-600" />
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-900">
              <th className="text-left py-2 px-3 text-white/80 font-bold text-[11px] whitespace-nowrap">{headers[0]}</th>
              {headers.slice(1).map((h, i) => (
                <th key={i} className="text-right py-2 px-3 text-white/80 font-bold text-[11px] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={`border-b border-gray-100 last:border-b-0 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                <td className="py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">{r.label}</td>
                {r.cells.map((c, j) => (
                  <td key={j} className={`py-2 px-3 text-right font-black tabular-nums whitespace-nowrap ${r.colorCells ? valueColor(c) : 'text-gray-800'}`}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// A single, specific line-item lookup ("total current assets 2023-24", "trade receivables",
// "EBITDA") — the backend's own `focusedMetric` flag means it matched exactly ONE row, not a
// broad topic. Deliberately minimal and identical in shape every time: just the metric name and
// its value (+ a compact per-year breakdown when more than one year of data came back) — no
// company hero header, no CIN/industry badges, no trend chart. Every one of these answers should
// render in one consistent, simple format — every one of these answers,
// across every statement/tab, was rendering through the full AssistantAnswerTurn dashboard
// (company name card + a bar chart) regardless of how narrow the actual question was; this gives
// focused questions their own consistently plain answer shape instead.
const FocusedMetricTurn = ({ result, instant = false }) => {
  const { startAt, advance } = useTypeSequence(instant)
  // Stage 0 = metric label, stage 1 = the headline value — everything after (trend badge,
  // chart/table, computedFrom, Notes) waits for the value to finish typing before appearing,
  // so the whole card reveals top to bottom with nothing shown ahead of its own turn.
  const insightsBaseStage = 2 + (result.computedFrom ? 1 : 0)
  const metrics = result.keyMetrics || []
  // The backend's own record of which row it matched wins — found live: for some intents
  // keyMetrics still carries several related rows (a same-topic bucket), not just the one this
  // query actually asked about ("total liabilities" matched keyMetrics also containing Total
  // Assets/Net Worth/Borrowings alongside it) — filtering to the one whose label the backend
  // itself named avoids showing the whole bucket for a question that named one specific figure.
  const metric = (result.focusedMetricLabel
    && metrics.find(m => m.label?.startsWith(result.focusedMetricLabel))) || metrics[0]
  // Not every narrow-topic response uses the specificItemMode path's own singleMetricChart —
  // "gross sales all years" (Revenue intent) sends revenueChart, "EBITDA 2023-24" sends
  // ebitdaChart — whichever one this particular response actually populated is the series for
  // the ONE metric being shown above. NOT marginChart — its points are shaped {year,
  // grossMargin, ebitdaMargin, netMargin}, not this {year, value} shape (moot in practice: the
  // "margin" intent always sends 0 keyMetrics, which already keeps it out of this component
  // entirely, per classifyTurn's own gate — but worth being explicit here rather than relying
  // on that gate alone to avoid ever silently plotting `undefined` for every point).
  const series = result.chartData?.singleMetricChart || result.chartData?.revenueChart
    || result.chartData?.ebitdaChart || []
  // A row whose label carries "%" holds a percentage, not a currency amount — same test
  // getSingleMetricConfig already uses for the same reason (fmtMn would print "-₹21.20 Mn" for
  // a -21.2% margin instead of "-21.2%").
  const isPercent = /%/.test(metric?.label || '')
  // chartData.singleMetricChart sends the RAW ratio (0.0532 for 5.32%), never pre-scaled —
  // found live: "EBITDA margin all years" showed the top value
  // correctly as "18.4%" (keyMetrics' own value is pre-formatted server-side) but the per-year
  // trend table underneath showed "0.1%"/"0.2%" — this multiplier was missing, so a query
  // where the user never typed "%" at all (a percent row was simply what they asked for, e.g.
  // "margin") still showed a plainly wrong number instead of no data being percent-scaled
  // until actually asked for.
  const yFmt = isPercent ? (v) => `${(v * 100).toFixed(1)}%` : (v) => fmtMn(v, result.currencyUnit)
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100/60 px-6 py-5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center flex-shrink-0">
          <FaChartBar className="text-[#ff7010] text-xs" />
        </div>
        <div className="flex-1 min-w-0">
          {/* The description on top should be removed everywhere and only shown if an actual
              question is asked -- educationalNote is a broad category-wide note (e.g. asking for "gross
              margin" got a "Key Margin Metrics" block covering EBITDA/PBT/PAT margins, OCI,
              advertising-to-sales, none of which were asked about) -- found live, this is the
              SAME "give exactly what was asked" complaint already fixed for the insights list
              itself. Only shown when the query is actually a definitional question ("what is
              gross margin in Astrotalk", "explain EBITDA") -- a plain value ask ("Astrotalk
              gross margin 2023-24") gets just the number and its notes, no unrequested essay. */}
          {result.educationalNote && /\b(what\s*'?s|what\s+is|what\s+are|explain\w*|defin\w*|descri\w*|meaning\s+of)\b/i.test(result.query || '') && (
            <p className="mb-3 text-xs text-gray-500 leading-relaxed bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
              {result.educationalNote}
            </p>
          )}
          {metric ? (
            <>
              <p className="text-sm font-bold text-gray-800 mb-1">
                <TypewriterText instant={instant} text={cleanMetricLabel(metric.label)} start={startAt(0)} onDone={advance(0)} />
              </p>
              {/* Colour + trend arrow — the plain black-on-white number read as "just text",
                  not a finished financial product; red/green + a YoY arrow is the convention
                  every finance app uses, and costs nothing extra since the backend was already
                  computing `trend` — presentation matters, so it should
                  look like something was actually built, not just plumbing. */}
              {startAt(1) && (
                <div className="flex items-baseline gap-2 flex-wrap">
                  <p className={`text-2xl font-black ${valueColor(metric.value)}`}>
                    <TypewriterText instant={instant} text={String(metric.value ?? '')} start={startAt(1)} onDone={advance(1)} />
                    {/* Shown in a bracket right next to the value -- Gross Margin/EBITDA/
                        EBIT/PBT/PAT's own margin %, right next to the currency headline
                        (e.g. "₹6511.27 Mn (100.0%)"), not buried several notes down.
                        Backend-only field (percentLabel), only present when this specific
                        metric has a known %-of-Revenue counterpart. Held back until the value
                        itself is done typing, same as the trend badge next to it. */}
                    {metric.percentLabel && startAt(2) && (
                      <span className="text-base font-bold text-gray-400"> ({metric.percentLabel})</span>
                    )}
                  </p>
                  {startAt(2) && <TrendBadge trend={metric.trend} />}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">No data on record for this.</p>
          )}
          {/* A graph only makes sense once there's a trend to show — asking for ONE year
              ("total current assets 2024-25") stays plain data, just the value above; naming
              two or more years ("2023-24, 2024-25") is what turns this into a chart — no graph
              for a single year, only once multiple years are asked for. Held back (like
              computedFrom/Notes below) until the headline value has finished typing. */}
          {startAt(2) && series.length > 1 && (
            <>
              <div className="mt-3" style={{ height: 160 }}>
                <Bar
                  data={{
                    labels: series.map(d => d.year),
                    datasets: [{ data: series.map(d => d.value), backgroundColor: '#ff7010', hoverBackgroundColor: '#1a1f36', borderRadius: 5 }],
                  }}
                  options={barOpts(yFmt, null)}
                />
              </div>
              {/* Plain year|value table alongside the trend chart — every OTHER multi-year
                  card on this page (aiCalculation's perYear, compareMode's perYearCompare)
                  already pairs its graph with a table; this one only had the graph. The "detail"
                  ask was showing a table while the "all" ask showed only a graph — both should
                  show both. Separate from — and in addition to — the
                  formula-breakdown table below, which only appears for "detail"/"details". */}
              <SimpleTable
                headers={['Year', 'Value']}
                rows={series.map(d => ({ label: `FY ${d.year}`, cells: [d.value != null ? yFmt(d.value) : '—'] }))}
              />
            </>
          )}
          {/* "EBIT detail"/"gross margin detail"/... — the backend's own formula-chain
              breakdown (numerator/denominator rows the matched figure is built from) — found
              live: "EBIT detail" showed the trend graph but dropped
              this table entirely; this component never rendered singleMetricGroupStatement at
              all, even though the backend was already sending it for every "detail"/"details"
              ask. */}
          {startAt(2) && result.chartData?.singleMetricGroupStatement?.length > 0 && (
            <SimpleTable
              headers={['Particulars', ...(result.financialYears || []).map(yr => `FY ${yr}`)]}
              rows={result.chartData.singleMetricGroupStatement.map(row => {
                const rowIsPercent = /%/.test(row.label || '')
                return {
                  label: cleanMetricLabel(row.label),
                  cells: (row.values || []).map(v => v == null ? '—' : rowIsPercent ? `${(v * 100).toFixed(1)}%` : fmtMn(v, result.currencyUnit)),
                }
              })}
            />
          )}
          {/* The Python engine's own calculation trail (financial_formulas.py) for a metric it
              computed from base rows rather than read off one pre-computed Excel cell — the
              actual numbers plugged in, not just row names, e.g. "EBITDA = Revenue (₹6511.27 Mn)
              − Cost of Sales (₹0.00 Mn) − Total Expenses (₹5310.97 Mn) = ₹1200.31 Mn". Backend-
              only field the frontend never had a renderer for until now, so it silently never
              showed anywhere despite computedFrom being present in every response. */}
          {result.computedFrom && startAt(2) && (
            <p className="mt-3 text-[11px] text-gray-400 leading-relaxed border-t border-gray-100 pt-2">
              <span className="font-bold text-gray-500">How this was calculated: </span>
              <TypewriterText instant={instant} text={result.computedFrom} start={startAt(2)} onDone={advance(2)} />
            </p>
          )}
          {result.insights?.length > 0 && startAt(insightsBaseStage) && (
            <div className="mt-3 border-t border-gray-100 pt-2.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Notes</p>
              <div className="space-y-1.5">
                {result.insights.map((ins, i) => {
                  const stageNum = insightsBaseStage + i
                  if (!startAt(stageNum)) return null
                  return (
                    <p key={i} className="flex items-start gap-1.5 text-xs text-gray-600 leading-relaxed">
                      <span className="w-1 h-1 rounded-full bg-[#ff7010] flex-shrink-0 mt-1.5" />
                      <span><TypewriterText instant={instant} text={ins} start={startAt(stageNum)} onDone={advance(stageNum)} /></span>
                    </p>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const RankingTurn = ({ result, onFollowUp }) => (
              <div>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5">
                  {/* ── Plain text header — no dark card, matches ChatGPT's own minimal
                       style; the ranking table below is the actual content. ── */}
                  <div className="px-6 pt-5 pb-4">
                    <span className="inline-flex items-center gap-1.5 text-[#ff7010] text-[10px] font-black uppercase tracking-widest">
                      <FaChartBar className="text-[10px]" />
                      {result.direction === 'bottom' ? 'Bottom' : 'Top'} {result.count} by {result.metric}
                    </span>
                    <h1 className="text-gray-900 font-bold text-lg mt-1.5 capitalize">
                      {result.query}
                    </h1>
                    <p className="text-gray-400 text-xs mt-1">
                      Ranked locally across {result.totalMatched} compan{result.totalMatched === 1 ? 'y' : 'ies'} with data for {result.metric}
                    </p>
                  </div>

                  {(!result.companies || result.companies.length === 0) ? (
                    <div className="px-6 py-10 text-center">
                      <p className="text-sm text-gray-400">{result.message || 'No matching data found.'}</p>
                    </div>
                  ) : (
                    <div className="px-6 py-5 overflow-x-auto">
                      <table className="w-full text-sm border-collapse rounded-xl overflow-hidden min-w-max">
                        <thead>
                          <tr className="bg-gray-900">
                            <th className="text-left py-3 px-4 text-[11px] font-bold text-white/80 w-12">#</th>
                            <th className="text-left py-3 px-4 text-[11px] font-bold text-white/80">Company</th>
                            <th className="text-left py-3 px-4 text-[11px] font-bold text-white/80">Industry</th>
                            <th className="text-right py-3 px-4 text-[11px] font-bold text-white/80">{result.metric}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.companies.map((c) => (
                            <tr key={c.companyId} className={`border-b border-gray-100 ${c.rank % 2 === 0 ? 'bg-gray-50/50' : ''} hover:bg-orange-50/40 cursor-pointer`}
                              onClick={() => onFollowUp(`${c.companyName} financial overview`)}>
                              <td className="py-3 px-4 text-xs font-black text-[#ff7010]">{c.rank}</td>
                              <td className="py-3 px-4 text-xs font-bold text-gray-900">{c.companyName}</td>
                              <td className="py-3 px-4 text-xs text-gray-500">{c.industry || '—'}</td>
                              <td className="py-3 px-4 text-right text-xs font-bold text-gray-800 tabular-nums">
                                {/flag/i.test(result.metric)
                                  ? (c.value === 1 ? 'Yes' : c.value === 0 ? 'No' : '—')
                                  : /[%]/.test(c.matchedLabel || '') || /margin|growth|roe|roce|roa|rate/i.test(result.metric)
                                  ? `${c.value.toFixed(2)}%`
                                  : fmtMn(c.value, result.currencyUnit)}
                                <span className="block text-[9px] font-normal text-gray-400 mt-0.5">{c.matchedLabel}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
)

// One company's card inside a comparison — its own component (rather than inline JSX in
// the .map below) purely so it can hold its own useTypeSequence: computedFrom types out,
// then each Notes bullet types one after another, independently of every other company's card.
const CompareCompanyCard = ({ c, ci, currencyUnit, instant }) => {
  const { startAt, advance } = useTypeSequence(instant)
  const insightsBaseStage = c.computedFrom ? 1 : 0
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100/60 overflow-hidden flex flex-col">
      <div className="bg-gray-900 px-4 py-3">
        <p className="text-white font-black text-sm truncate">{c.companyName || c.detectedCompany || `Company ${ci + 1}`}</p>
        {c.financialYears?.length > 0 && (
          <p className="text-white/50 text-[10px] mt-0.5">{c.financialYears.join(' → ')}</p>
        )}
      </div>
      <div className="p-4 space-y-2.5 flex-1">
        {/* Same local calculation fallback as the single-company view — runs
            independently per company since compareCompanies() calls search()
            once for each, so a query like "CompanyA vs CompanyB revenue divided
            by employee count" gets its own computed answer per card here. */}
        {c.aiCalculation && (
          <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-2.5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-1">
                <FaRobot className="text-[9px]" /> Calculated Answer
              </p>
              <CopyButton
                className="text-indigo-400 hover:text-indigo-600"
                text={[
                  c.aiCalculation.value != null
                    ? `${c.aiCalculation.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}${c.aiCalculation.unit ? ` ${c.aiCalculation.unit}` : ''}`
                    : null,
                  c.aiCalculation.formula,
                ].filter(Boolean).join('\n')}
              />
            </div>
            {c.aiCalculation.error ? (
              <p className="text-xs text-gray-500">{c.aiCalculation.answer}</p>
            ) : (
              <>
                {c.aiCalculation.value != null && (
                  <p className="text-base font-black text-indigo-700">
                    {c.aiCalculation.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    {c.aiCalculation.unit ? ` ${c.aiCalculation.unit}` : ''}
                  </p>
                )}
                {c.aiCalculation.formula && (
                  <p className="text-[10px] font-mono text-gray-500 mt-1 break-words">{c.aiCalculation.formula}</p>
                )}
              </>
            )}
          </div>
        )}
        {!c.success && (
          <p className="text-xs text-gray-400 italic">{c.message || 'No data available.'}</p>
        )}
        {/* keyMetrics only ever carries the latest year's figure, even when
            several years were picked (e.g. after answering the "which years"
            range prompt) — chartData's own year-tagged series is what actually
            has every requested year, so it takes priority whenever it's there. */}
        {(() => {
          if (!c.success || c.aiCalculation) return null
          const chartKey = ['singleMetricChart', 'revenueChart', 'profitChart', 'ebitdaChart']
            .find(k => (c.chartData?.[k] || []).length > 1)
          if (!chartKey) return null
          const isPercent = /%/.test(c.focusedMetricLabel || c.keyMetrics?.[0]?.label || '')
          return (
            <SimpleTable
              headers={['Year', 'Value']}
              rows={c.chartData[chartKey].map(p => ({
                label: `FY ${p.year}`,
                cells: [p.value == null ? '—' : isPercent ? `${(p.value * 100).toFixed(1)}%` : fmtMn(p.value, currencyUnit)],
              }))}
            />
          )
        })()}
        {/* Single latest-year snapshot — shown only when the multi-year
            breakdown above isn't available, so the two don't duplicate. */}
        {c.success && !c.aiCalculation
          && !['singleMetricChart', 'revenueChart', 'profitChart', 'ebitdaChart'].some(k => (c.chartData?.[k] || []).length > 1)
          && c.keyMetrics?.length > 0 && (
          <div className="space-y-1.5">
            {c.keyMetrics.slice(0, 6).map((m, i) => (
              <div key={i} className="flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-[11px] text-gray-500 truncate">{m.label}</p>
                <p className="text-xs font-bold text-gray-800 whitespace-nowrap">{m.value}</p>
              </div>
            ))}
          </div>
        )}
        {/* "revenue detail"/"EBIT detail" — same formula-chain breakdown
            (numerator/denominator rows) the single-company view shows via
            singleMetricGroupStatement, scoped to this company's own figures. */}
        {c.success && !c.aiCalculation && c.chartData?.singleMetricGroupStatement?.length > 0 && (
          <SimpleTable
            headers={['Particulars', ...(c.financialYears || []).map(yr => `FY ${yr}`)]}
            rows={c.chartData.singleMetricGroupStatement.map(row => {
              const rowIsPercent = /%/.test(row.label || '')
              return {
                label: cleanMetricLabel(row.label),
                cells: (row.values || []).map(v => v == null ? '—' : rowIsPercent ? `${(v * 100).toFixed(1)}%` : fmtMn(v, currencyUnit)),
              }
            })}
          />
        )}
        {c.success && !c.aiCalculation
          && !['singleMetricChart', 'revenueChart', 'profitChart', 'ebitdaChart'].some(k => (c.chartData?.[k] || []).length > 1)
          && !(c.keyMetrics?.length > 0) && !(c.chartData?.singleMetricGroupStatement?.length > 0) && (
          <p className="text-xs text-gray-400 italic">No specific data found for this query.</p>
        )}
        {/* Same "How this was calculated"/Notes treatment the single-company
            view already gives (FocusedMetricTurn) -- each company's own sub-
            answer here already carries its own computedFrom/insights from the
            backend (compareCompanies() calls search() once per company), but
            this per-company card never had a renderer for either field, so a
            comparison silently dropped the exact same calculation trail and
            DSJ Insights narrative a single-company search of the same metric
            already shows. */}
        {c.computedFrom && (
          <p className="text-[11px] text-gray-400 leading-relaxed border-t border-gray-100 pt-2">
            <span className="font-bold text-gray-500">How this was calculated: </span>
            <TypewriterText instant={instant} text={c.computedFrom} start={startAt(0)} onDone={advance(0)} />
          </p>
        )}
        {c.insights?.length > 0 && startAt(insightsBaseStage) && (
          <div className="border-t border-gray-100 pt-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Notes</p>
            <div className="space-y-1">
              {c.insights.map((ins, i) => {
                const stageNum = insightsBaseStage + i
                if (!startAt(stageNum)) return null
                return (
                  <p key={i} className="flex items-start gap-1.5 text-[11px] text-gray-600 leading-relaxed">
                    <span className="w-1 h-1 rounded-full bg-[#ff7010] flex-shrink-0 mt-1.5" />
                    <span><TypewriterText instant={instant} text={ins} start={startAt(stageNum)} onDone={advance(stageNum)} /></span>
                  </p>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const ComparisonTurn = ({ result, instant = false }) => (
              <div>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5">
                  {/* ── Plain text header — no dark card, matches ChatGPT's own minimal
                       style; the comparison table below is the actual content. ── */}
                  <div className="px-6 pt-5 pb-4">
                    <span className="inline-flex items-center gap-1.5 text-[#ff7010] text-[10px] font-black uppercase tracking-widest">
                      <FaChartBar className="text-[10px]" /> Comparing {result.companies.length} Companies
                    </span>
                    <h1 className="text-gray-900 font-bold text-lg mt-1.5">
                      {(result.query || 'Comparison').charAt(0).toUpperCase() + (result.query || 'comparison').slice(1)}
                    </h1>
                    <p className="text-gray-400 text-xs mt-1">
                      {result.companies.map(c => c.companyName || c.detectedCompany).filter(Boolean).join('  •  ')}
                    </p>
                  </div>

                  {/* ── Cross-company calculation — ONE combined number spanning both
                      companies (e.g. "Company A's revenue minus Company B's revenue"),
                      computed locally by AiCalcEngine.computeCrossCompany. Distinct from the
                      per-company cards below, which each only use that one company's own data. */}
                  {result.crossCompanyCalculation && (
                    <div className="px-6 py-5 border-t border-gray-100 bg-indigo-50/40">
                      <div className="flex items-center gap-2 mb-2">
                        <FaRobot className="text-indigo-500 text-xs" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Cross-Company Calculated Answer</p>
                      </div>
                      {result.crossCompanyCalculation.error ? (
                        <p className="text-sm text-gray-500">{result.crossCompanyCalculation.answer}</p>
                      ) : (
                        <>
                          {result.crossCompanyCalculation.value != null && (
                            <p className="text-2xl font-black text-indigo-700 mb-2">
                              {result.crossCompanyCalculation.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                              {result.crossCompanyCalculation.unit ? ` ${result.crossCompanyCalculation.unit}` : ''}
                            </p>
                          )}
                          {result.crossCompanyCalculation.formula && (
                            <p className="text-xs font-mono text-gray-600 bg-white rounded-lg px-3 py-2 border border-indigo-100 break-words">
                              {result.crossCompanyCalculation.formula}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* ── Numeric comparison table — companies as columns, headline
                       financial numbers as rows, so the actual figures sit side by side
                       instead of only the qualitative insight cards below. Own separate
                       white section (not inside the dark hero banner above). ── */}
                  {(() => {
                    const colNames = result.companies.map((c, ci) => c.companyName || c.detectedCompany || `Company ${ci + 1}`)

                    // Prefer whichever full statement (Balance Sheet / P&L / Cash Flow / Margin
                    // Analysis) the comparison topic actually resolved to, over the fixed
                    // Revenue/PAT/EBITDA snapshot below — found live: comparing "balance sheet"
                    // between two companies still only ever showed Revenue/PAT/EBITDA, never
                    // the balance sheet figures actually asked for.
                    const STATEMENT_DEFS = [
                      { key: 'balanceSheetStatement',   title: 'Balance Sheet' },
                      { key: 'profitLossStatement',     title: 'Profit & Loss' },
                      { key: 'cashFlowStatement',       title: 'Cash Flow' },
                      { key: 'marginAnalysisStatement', title: 'Margin Analysis' },
                    ]
                    const statementDef = STATEMENT_DEFS.find(s => result.companies.some(c => c.chartData?.[s.key]?.length > 0))

                    let tableTitle = 'Head-to-Head Comparison'
                    let rows = []

                    // "Jidoka compare Anmasa gross margin EBITDA EBIT PAT" — per the "Key Words"
                    // spec: several metrics named side by side, no
                    // "compare"/"and" between them. Backend attaches these as each company's
                    // own "multiMetrics" (see AiSearchService.compareCompanies) — checked
                    // BEFORE statementDef below since naming specific metrics is a more
                    // precise signal than whichever full statement happened to also populate.
                    const hasMultiMetrics = result.companies.some(c => c.multiMetrics?.length >= 2)

                    if (hasMultiMetrics) {
                      const labelOrder = []
                      const byLabel = new Map()
                      result.companies.forEach((c, ci) => {
                        (c.multiMetrics || []).forEach(m => {
                          const clean = cleanStatementLabel(m.label)
                          if (!byLabel.has(clean)) { byLabel.set(clean, new Array(result.companies.length).fill(null)); labelOrder.push(clean) }
                          byLabel.get(clean)[ci] = m.rawValue
                        })
                      })
                      rows = labelOrder
                        .map(label => ({ label, cells: byLabel.get(label).map(v => (v == null ? null : { value: v })) }))
                        .filter(row => row.cells.some(cell => cell?.value != null))
                    } else if (statementDef) {
                      tableTitle = `Head-to-Head Comparison — ${statementDef.title}`
                      const labelOrder = []
                      const byLabel = new Map()
                      result.companies.forEach((c, ci) => {
                        const stRows = c.chartData?.[statementDef.key] || []
                        stRows.forEach(r => {
                          if (r.isHeader) return
                          const clean = cleanStatementLabel(r.label)
                          if (!byLabel.has(clean)) { byLabel.set(clean, new Array(result.companies.length).fill(null)); labelOrder.push(clean) }
                          const vals = (r.values || []).filter(v => v != null)
                          byLabel.get(clean)[ci] = vals.length ? vals[vals.length - 1] : null
                        })
                      })
                      rows = labelOrder
                        .map(label => ({ label, cells: byLabel.get(label).map(v => (v == null ? null : { value: v })) }))
                        .filter(row => row.cells.some(cell => cell?.value != null))
                    } else if (result.companies.some(c => c.chartData?.singleMetricChart?.length > 0)) {
                      // One specific named metric that isn't Revenue/PAT/EBITDA and doesn't
                      // populate a full statement — e.g. "CompanyA vs CompanyB gross margin"
                      // (same table+graph 3-way comparisons already
                      // get should also show for 2-way) — each company's own focused-metric
                      // series (search()'s singleMetricChart, same field FocusedMetricTurn
                      // plots for a single-company ask) becomes the one comparison row.
                      const withFocus = result.companies.find(c => c.focusedMetricLabel)
                      const label = cleanMetricLabel(withFocus?.focusedMetricLabel
                        || result.companies.find(c => c.keyMetrics?.[0]?.label)?.keyMetrics[0].label
                        || 'Value')
                      // "revenue all"/"revenue all years" sends every year in singleMetricChart,
                      // not just the latest — collapsing straight to latestArrValue dropped the
                      // rest of the years the query actually asked for. One row per year once
                      // more than one came back; otherwise keep the single latest-value row.
                      const isMultiYear = result.companies.some(c => (c.chartData?.singleMetricChart || []).length > 1)
                      if (isMultiYear) {
                        tableTitle = `Head-to-Head Comparison — ${label} by Year`
                        const years = [...new Set(result.companies.flatMap(c => (c.chartData?.singleMetricChart || []).map(p => p.year)))].sort()
                        rows = years
                          .map(yr => ({
                            label: `FY ${yr}`,
                            cells: result.companies.map(c => {
                              const pt = (c.chartData?.singleMetricChart || []).find(p => p.year === yr)
                              return pt?.value == null ? null : { value: pt.value }
                            }),
                          }))
                          .filter(row => row.cells.some(cell => cell?.value != null))
                      } else {
                        rows = [{
                          label,
                          cells: result.companies.map(c => {
                            const v = latestArrValue((c.chartData?.singleMetricChart || []).map(p => p.value))
                            return v == null ? null : { value: v }
                          }),
                        }].filter(row => row.cells.some(cell => cell?.value != null))
                      }
                    } else {
                      const metricDefs = [
                        { label: 'Revenue',             chart: 'revenueChart' },
                        { label: 'Net Profit / PAT',    chart: 'profitChart' },
                        { label: 'EBITDA',               chart: 'ebitdaChart' },
                      ]
                      // A bare "revenue" (or PAT/EBITDA) ask matches the whole intent bucket,
                      // not one specific row, so it lands here rather than the singleMetricChart
                      // branch above — but it can still carry several years once the user has
                      // picked a year range. One row per metric per year in that case, instead
                      // of always collapsing to the latest year regardless of what was asked.
                      const isMultiYear = metricDefs.some(md =>
                        result.companies.some(c => (c.chartData?.[md.chart] || []).length > 1))
                      if (isMultiYear) {
                        tableTitle = 'Head-to-Head Comparison — by Year'
                        rows = metricDefs.flatMap(md => {
                          const years = [...new Set(result.companies.flatMap(c => (c.chartData?.[md.chart] || []).map(p => p.year)))].sort()
                          return years.map(yr => ({
                            label: `${md.label} — FY ${yr}`,
                            cells: result.companies.map(c => {
                              const pt = (c.chartData?.[md.chart] || []).find(p => p.year === yr)
                              return pt?.value == null ? null : { value: pt.value }
                            }),
                          }))
                        }).filter(row => row.cells.some(cell => cell?.value != null))
                      } else {
                        rows = metricDefs
                          .map(md => ({
                            label: md.label,
                            cells: result.companies.map(c => {
                              // revenueChart/profitChart/ebitdaChart hold {year, value} objects,
                              // not plain numbers — map to .value first (fixes "₹NaN Mn").
                              const v = latestArrValue((c.chartData?.[md.chart] || []).map(p => p.value))
                              return v == null ? null : { value: v }
                            }),
                          }))
                          .filter(row => row.cells.some(cell => cell?.value != null))
                      }
                    }

                    if (rows.length === 0) return null

                    // Computed comparison sentences — "who has more, by how much". For 2
                    // companies this is the one obvious pair. For 3+, collapsing to just the
                    // overall highest vs lowest skipped every company in between — sort each
                    // row's values highest to lowest and pair off neighbours (1st vs 2nd, 2nd
                    // vs 3rd, ...) instead, so every company appears in at least one sentence.
                    // pctByIdx keeps this same pair-off, keyed by column index, so the table
                    // cells below can show "(-X%)" right next to the lower figure too — found
                    // live: the % difference already existed as a sentence UNDER the table, but
                    // not as the bracket right next to the number itself — it was needed there too.
                    const rowComparisons = rows.map(row => {
                      const ranked = row.cells
                        .map((cell, ci) => (cell?.value != null ? { value: cell.value, idx: ci } : null))
                        .filter(Boolean)
                        .sort((a, b) => b.value - a.value)
                      const pairs = []
                      const pctByIdx = {}
                      for (let i = 0; i < ranked.length - 1; i++) {
                        const hiE = ranked[i], loE = ranked[i + 1]
                        if (hiE.value === loE.value) continue
                        const diff = hiE.value - loE.value
                        const pct  = loE.value !== 0 ? (diff / Math.abs(loE.value)) * 100 : null
                        pairs.push({ label: row.label, higher: colNames[hiE.idx], lower: colNames[loE.idx], diff, pct })
                        if (pct != null) pctByIdx[loE.idx] = pct
                      }
                      return { pairs, pctByIdx }
                    })
                    const verdicts = rowComparisons.flatMap(r => r.pairs)

                    const chartColors = ['#ff7010', '#1a1f36', '#6366f1', '#10b981', '#f59e0b']

                    return (
                      <div className="px-6 py-5 border-t border-gray-100 overflow-x-auto">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1 h-4 rounded-full bg-indigo-500" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-700">{tableTitle}</p>
                        </div>
                        {/* Bar chart alongside the table — a graph is wanted everywhere a
                            comparison happens. One group of bars per row, one bar
                            per company, so it works the same for 2 companies or 3+. */}
                        <div className="mb-5" style={{ height: 220, minWidth: rows.length * 90 }}>
                          <Bar
                            data={{
                              labels: rows.map(r => r.label),
                              datasets: result.companies.map((c, ci) => ({
                                label: colNames[ci],
                                data: rows.map(r => r.cells[ci]?.value ?? null),
                                backgroundColor: chartColors[ci % chartColors.length],
                                borderRadius: 4,
                              })),
                            }}
                            options={{
                              ...barOpts((v) => fmtMn(v, result.currencyUnit)),
                              plugins: {
                                ...barOpts((v) => fmtMn(v, result.currencyUnit)).plugins,
                                legend: { display: true, position: 'bottom', labels: { font: { size: 10 }, color: '#6b7280', boxWidth: 9, boxHeight: 9, borderRadius: 3, padding: 8, usePointStyle: true, pointStyle: 'circle' } },
                              },
                            }}
                          />
                        </div>
                        <table className="w-full text-sm border-collapse rounded-xl overflow-hidden min-w-max">
                          <thead>
                            <tr className="bg-gray-900">
                              <th className="text-left py-3 px-4 text-[11px] font-bold text-white/80">Particulars</th>
                              {colNames.map((name, i) => (
                                <th key={i} className="text-right py-3 px-3 text-[11px] font-bold text-white/80 whitespace-nowrap">{name}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row, i) => {
                              const { pctByIdx } = rowComparisons[i]
                              return (
                              <tr key={i} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                                <td className="py-3 px-4 text-gray-700 text-xs font-semibold whitespace-nowrap">{row.label}</td>
                                {row.cells.map((cell, j) => (
                                  <td key={j} className="py-3 px-3 text-right text-xs text-gray-800 tabular-nums font-bold whitespace-nowrap">
                                    {cell?.value != null ? fmtMn(cell.value, result.currencyUnit) : '—'}
                                    {pctByIdx[j] != null && (
                                      <span className="ml-1 text-[10px] font-normal text-gray-400">(-{pctByIdx[j].toFixed(1)}%)</span>
                                    )}
                                    {cell?.year != null && <span className="block text-[9px] font-normal text-gray-400 mt-0.5">FY {cell.year}</span>}
                                  </td>
                                ))}
                              </tr>
                              )
                            })}
                          </tbody>
                        </table>

                        {verdicts.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {verdicts.map((v, i) => (
                              <div key={i}
                                className="flex items-start gap-2 text-xs text-gray-700 bg-indigo-50/50 border border-indigo-100 rounded-lg px-3 py-2"
                                style={{ animation: 'aiRevealIn 0.4s ease-out both', animationDelay: `${i * 0.08}s` }}>
                                <FaChartBar className="text-indigo-400 mt-0.5 flex-shrink-0" />
                                <span>
                                  <span className="font-bold text-gray-900">{v.higher}</span> has higher {v.label} than{' '}
                                  <span className="font-semibold">{v.lower}</span> by {fmtMn(v.diff, result.currencyUnit)}
                                  {v.pct != null && ` (${v.pct.toFixed(1)}% more)`}.
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>

                <div className={`grid gap-4 mb-5 ${result.companies.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                  {result.companies.map((c, ci) => (
                    <CompareCompanyCard key={ci} c={c} ci={ci} currencyUnit={result.currencyUnit} instant={instant} />
                  ))}
                </div>
              </div>
)

const AssistantAnswerTurn = ({ result, onFollowUp, instant = false }) => {
  // Sequences this card's own prose blocks (summary/computedFrom, then Notes/Key Highlights
  // bullets one by one) — the aiCalculation and general/summary branches below are mutually
  // exclusive per render, so both safely share the one stage counter.
  const { startAt, advance } = useTypeSequence(instant)
  // Report selector state — LOCAL to this turn (was page-level before the
  // conversation-thread redesign) so an older turn's year/type selectors keep working
  // independently after newer turns are appended.
  const [selectedYears,      setSelectedYears]      = useState([])
  const [selectedTypes,      setSelectedTypes]      = useState(['financialStatements'])
  // Never set to anything else (confirmed dead — no caller in this codebase ever populates
  // these), kept as plain constants rather than state so nothing tries to mutate them.
  const lastSearchedTypes = []
  const lastSearchedYears = []

  // Shareholding Pattern category filter (Founder/Angel Investor/VC/...) — clicked in the
  // result itself, filters the already-loaded shareholder table/pie client-side instead of
  // requiring a brand new search query. Separate state for Equity vs Preference shareholders
  // since the two tables can have different categories (e.g. "CCPS Holder" only on preference).
  const [shCategoryFilter,   setShCategoryFilter]   = useState(null)
  const [prefCategoryFilter, setPrefCategoryFilter] = useState(null)

  // Full financial statement accordion state — { "bs-2": false, ... } keyed by
  // `${statementKey}-${groupIndex}`. Expanded by default (whole statement visible
  // with no clicking needed) — a key is only present once a heading is explicitly
  // collapsed.
  const [openStatementGroups, setOpenStatementGroups] = useState({})
  const toggleStatementGroup = (key) =>
    setOpenStatementGroups(prev => ({ ...prev, [key]: prev[key] === false ? true : false }))

  // "Copy all" — grabs the rendered text of the WHOLE answer (whatever's actually on
  // screen right now: key metrics, overview, statements, highlights, ...) via innerText
  // rather than hand-assembling a string, so it always matches what the user sees,
  // filters and all, without needing to keep a separate text template in sync with
  // every section above. Read live at click time (not baked into a prop) since the ref
  // only gets attached after this turn's first render.
  const answerRef = useRef(null)
  const [copiedAll, setCopiedAll] = useState(false)
  const handleCopyAll = async (e) => {
    e.stopPropagation()
    const text = answerRef.current?.innerText?.trim()
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    } catch {
      // Clipboard API unavailable — nothing else to fall back to (see CopyButton.jsx).
    }
  }

  useEffect(() => {
    if (!result) return
    if (lastSearchedYears.length > 0) {
      // Analyze was clicked with specific years — restore exactly those selections
      setSelectedYears([...lastSearchedYears])
    } else if (result.yearIndex != null && result.yearIndex >= 0) {
      // Plain search that mentioned a year — highlight that year
      setSelectedYears([result.yearIndex])
    } else {
      setSelectedYears([])
    }
    if (lastSearchedTypes.length === 0) {
      setSelectedTypes([result.pdfType || 'financialStatements'])
    }
    setOpenStatementGroups({})
    setShCategoryFilter(null)
    setPrefCategoryFilter(null)
  }, [result?.companyId, result?.query])

  // ── Multi-download (years × types → PDF or ZIP) ───────────────────────────
  const handleMultiDownload = () => {
    if (!result?.companyId || !selectedTypes.length) return
    const types = selectedTypes.join(',')
    const yearParam = selectedYears.length > 0 ? `&yearIndices=${selectedYears.join(',')}` : ''
    window.open(`${config.DSJ_API_URL}/api/smart-excel/${result.companyId}/download-pdf?type=${types}${yearParam}`, '_blank')
  }

              // A "financial statement" search shows ONLY financial-statement content
              // (Annual Performance blurb, Financials at a Glance, the Balance
              // Sheet/P&L/Cash Flow statements) — Company Overview, key metrics,
              // charts and the cap table are general-search-only content.
              const isFinancialStatementQuery = isFinancialStatementSearch(result.query, lastSearchedTypes)
              // A pure "EBITDA" / "EBIT" / "Gross Margin" search shows ONLY that one
              // metric's stat tile + its own trend chart — not the rest of the metrics,
              // not Company Overview, not unrelated charts.
              const singleMetricMode   = detectSingleMetricMode(result.query, result)
              const singleMetricConfig = singleMetricMode ? getSingleMetricConfig(singleMetricMode, result) : null
              return (
              <div ref={answerRef}>

                {/* ── AI Calculated Answer — free-form calculation the rule-based engine
                    above couldn't answer directly (a custom ratio, cross-statement math,
                    etc.), computed locally by AiCalcEngine from this company's own parsed
                    financial data — no external API call. Only present when the backend
                    actually ran that fallback. */}
                <Reveal index={0}>
                {result.aiCalculation && (
                  // Same card shape as FocusedMetricTurn's plain data-lookup answer (orange
                  // avatar, title, big value, small caption underneath) — a calculated ratio
                  // and a raw looked-up figure are both just "the answer" to the user, so they
                  // read identically now instead of one having a colored header bar and an
                  // indigo number while the other stayed plain — they should match, kept simple
                  // like the one above.
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100/60 px-6 py-5 mb-5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center flex-shrink-0">
                        <FaChartBar className="text-[#ff7010] text-xs" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-end mb-1">
                          <CopyButton
                            className="text-gray-300 hover:text-gray-600 flex-shrink-0"
                            text={result.aiCalculation.compareMode
                              ? (result.aiCalculation.itemsPerYear?.length > 0
                                  ? [result.aiCalculation.items.map(it => it.label).join('\t'),
                                     ...result.aiCalculation.itemsPerYear.map(y =>
                                       `FY ${y.year}: ` + y.values.map((v, ii) => `${v ?? '—'}${result.aiCalculation.items[ii]?.unit || ''}`).join(' | '))]
                                  : result.aiCalculation.items?.length >= 3
                                  ? result.aiCalculation.items.map(it => `${it.label}: ${it.value}${it.unit || ''}`)
                                  : result.aiCalculation.perYearCompare
                                  ? [`${result.aiCalculation.leftLabel} vs ${result.aiCalculation.rightLabel}`,
                                     ...result.aiCalculation.perYearCompare.map(y =>
                                       `FY ${y.year}: ${y.leftValue ?? '—'}${result.aiCalculation.leftUnit || ''} vs ${y.rightValue ?? '—'}${result.aiCalculation.rightUnit || ''}`)]
                                  : [`${result.aiCalculation.leftLabel}: ${result.aiCalculation.leftValue}${result.aiCalculation.leftUnit || ''}`,
                                     `${result.aiCalculation.rightLabel}: ${result.aiCalculation.rightValue}${result.aiCalculation.rightUnit || ''}`]
                                ).join('\n')
                              : result.aiCalculation.perYear
                              ? [result.aiCalculation.label, ...result.aiCalculation.perYear.map(y => `FY ${y.year}: ${y.formula}`)].filter(Boolean).join('\n')
                              : [
                                  result.aiCalculation.value != null
                                    ? `${result.aiCalculation.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}${result.aiCalculation.unit ? ` ${result.aiCalculation.unit}` : ''}`
                                    : result.aiCalculation.answer,
                                  result.aiCalculation.formula,
                                ].filter(Boolean).join('\n')}
                          />
                        </div>
                        {result.aiCalculation.compareMode ? (
                          <>
                            {/* "X compare Y"/"X vs Y" — two figures shown side by side, NOT
                                divided into one ratio — a compare was wrongly being divided;
                                "compare" now
                                has its own dedicated shape on the backend instead of being
                                treated as a division operator). */}
                            {result.aiCalculation.itemsPerYear?.length > 0 ? (
                              // "A compare B compare C all years" — an "all years" ask should
                              // return every year with a table, same graph+table shape the two-operand
                              // perYearCompare case below already has, extended to N items.
                              <>
                                <div className="mb-4" style={{ height: 200 }}>
                                  <Bar
                                    data={{
                                      labels: result.aiCalculation.itemsPerYear.map(y => y.year),
                                      datasets: result.aiCalculation.items.map((it, ii) => ({
                                        label: it.label,
                                        data: result.aiCalculation.itemsPerYear.map(y => y.values[ii]),
                                        backgroundColor: ['#ff7010', '#1a1f36', '#6366f1', '#10b981', '#f59e0b'][ii % 5],
                                        borderRadius: 4,
                                      })),
                                    }}
                                    options={{
                                      ...barOpts((v) => `${v?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}${result.aiCalculation.items[0]?.unit || ''}`),
                                      plugins: {
                                        ...barOpts((v) => fmtMn(v, result.currencyUnit)).plugins,
                                        legend: { display: true, position: 'bottom', labels: { font: { size: 10 }, color: '#6b7280', boxWidth: 9, boxHeight: 9, borderRadius: 3, padding: 8, usePointStyle: true, pointStyle: 'circle' } },
                                      },
                                    }}
                                  />
                                </div>
                                <SimpleTable
                                  headers={['Year', ...result.aiCalculation.items.map(it => it.label)]}
                                  rows={result.aiCalculation.itemsPerYear.map(y => ({
                                    label: `FY ${y.year}`,
                                    cells: y.values.map((v, ii) => v != null
                                      ? `${v.toLocaleString('en-IN', { maximumFractionDigits: 2 })}${result.aiCalculation.items[ii]?.unit || ''}`
                                      : '—'),
                                  }))}
                                />
                              </>
                            ) : result.aiCalculation.items?.length >= 3 ? (
                              // "A compare B compare C" — three or more figures at once
                              // (per the "Key Words" spec, items 21/22).
                              // Same tile shape as the two-way case below, just N tiles in a
                              // responsive grid instead of a fixed 2-column one — plus a bar
                              // chart and %-difference lines against the first item, added
                              // so a graph and % data show up wherever a comparison happens,
                              // to match what every other compare shape
                              // on this page now shows. Tiles shown BEFORE the chart — the
                              // numbers are the direct answer to what was asked, the chart is
                              // supporting visual, same order FocusedMetricTurn's own value+
                              // chart already uses.
                              <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
                                  {result.aiCalculation.items.map((it, i) => (
                                    <div key={i} className="min-w-0">
                                      <p className="text-xs font-bold text-gray-500 mb-1 truncate">{it.label}</p>
                                      <p className="text-xl font-black text-gray-900">
                                        {it.value != null ? it.value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '—'}
                                        {it.unit || ''}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                                <div className="mb-4" style={{ height: 180 }}>
                                  <Bar
                                    data={{
                                      labels: result.aiCalculation.items.map(it => it.label),
                                      datasets: [{
                                        data: result.aiCalculation.items.map(it => it.value),
                                        backgroundColor: ['#ff7010', '#1a1f36', '#6366f1', '#10b981', '#f59e0b'],
                                        borderRadius: 5,
                                      }],
                                    }}
                                    options={barOpts((v) => `${v.toLocaleString('en-IN', { maximumFractionDigits: 2 })}${result.aiCalculation.items[0]?.unit || ''}`)}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  {result.aiCalculation.items.slice(1).map((it, i) => {
                                    const base = result.aiCalculation.items[0]
                                    if (base.value == null || it.value == null || base.value === 0) return null
                                    const pct = ((it.value - base.value) / Math.abs(base.value)) * 100
                                    const up = pct >= 0
                                    return (
                                      <p key={i} className="text-xs text-gray-600">
                                        <span className="font-semibold text-gray-900">{it.label}</span> is{' '}
                                        <span className={`font-bold ${up ? 'text-emerald-600' : 'text-red-600'}`}>
                                          {Math.abs(pct).toFixed(1)}% {up ? 'higher' : 'lower'}
                                        </span>{' '}
                                        than <span className="font-semibold">{base.label}</span>.
                                      </p>
                                    )
                                  })}
                                </div>
                                {/* "gross margin vs EBITDA vs EBIT detail" — each compared
                                    item's own formula breakdown, same as a single "EBITDA
                                    detail" ask already shows — a "detail" ask should return
                                    the detail. One small table
                                    per item, titled with that item's own row label. */}
                                {result.aiCalculation.itemDetails?.length > 0 && (
                                  <div className="mt-4 space-y-4">
                                    {result.aiCalculation.itemDetails.map((d, i) => (
                                      <div key={i}>
                                        <p className="text-xs font-bold text-gray-700 mb-1">{cleanMetricLabel(d.label)} — detail</p>
                                        <SimpleTable
                                          headers={['Particulars', ...(result.financialYears || []).map(yr => `FY ${yr}`)]}
                                          rows={d.rows.map(row => {
                                            const rowIsPercent = /%/.test(row.label || '')
                                            return {
                                              label: cleanMetricLabel(row.label),
                                              cells: (row.values || []).map(v => v == null ? '—' : rowIsPercent ? `${(v * 100).toFixed(1)}%` : fmtMn(v, result.currencyUnit)),
                                            }
                                          })}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            ) : result.aiCalculation.perYearCompare?.length > 0 ? (
                              <>
                                {/* Graph AND table together for "all years"/"year wise" compare
                                    — the table was missing on an "all" ask and needed to show too
                                    — same "graph only once there's a trend, table
                                    always" rule as every other multi-year card on this page. */}
                                {result.aiCalculation.perYearCompare.length > 1 && (
                                  <div className="mb-3" style={{ height: 180 }}>
                                    <Bar
                                      data={{
                                        labels: result.aiCalculation.perYearCompare.map(y => y.year),
                                        datasets: [
                                          { label: result.aiCalculation.leftLabel, data: result.aiCalculation.perYearCompare.map(y => y.leftValue), backgroundColor: '#ff7010', borderRadius: 5 },
                                          { label: result.aiCalculation.rightLabel, data: result.aiCalculation.perYearCompare.map(y => y.rightValue), backgroundColor: '#1a1f36', borderRadius: 5 },
                                        ],
                                      }}
                                      options={{
                                        responsive: true, maintainAspectRatio: false,
                                        plugins: {
                                          legend: { display: true, position: 'bottom', labels: { font: { size: 10 }, color: '#6b7280', boxWidth: 9, boxHeight: 9, borderRadius: 3, padding: 8, usePointStyle: true, pointStyle: 'circle' } },
                                          tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${c.raw?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` } },
                                        },
                                        scales: {
                                          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#9ca3af' } },
                                          y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 }, color: '#9ca3af' } },
                                        },
                                      }}
                                    />
                                  </div>
                                )}
                                <SimpleTable
                                  headers={['Year', result.aiCalculation.leftLabel, result.aiCalculation.rightLabel]}
                                  rows={result.aiCalculation.perYearCompare.map(y => ({
                                    label: `FY ${y.year}`,
                                    cells: [
                                      y.leftValue != null ? `${y.leftValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}${result.aiCalculation.leftUnit || ''}` : '—',
                                      y.rightValue != null ? `${y.rightValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}${result.aiCalculation.rightUnit || ''}` : '—',
                                    ],
                                  }))}
                                />
                              </>
                            ) : (
                              <>
                                {/* Bar chart + %-difference line for a plain single-year "X vs
                                    Y" — found live: only the
                                    multi-year perYearCompare branch above had a chart; the far
                                    more common single-year case showed just two bare numbers
                                    with no visual and no sense of "by how much". */}
                                {result.aiCalculation.leftValue != null && result.aiCalculation.rightValue != null && (
                                  <div className="mb-4" style={{ height: 160 }}>
                                    <Bar
                                      data={{
                                        labels: [result.aiCalculation.leftLabel, result.aiCalculation.rightLabel],
                                        datasets: [{
                                          data: [result.aiCalculation.leftValue, result.aiCalculation.rightValue],
                                          backgroundColor: ['#ff7010', '#1a1f36'],
                                          borderRadius: 5,
                                        }],
                                      }}
                                      options={barOpts((v) => `${v.toLocaleString('en-IN', { maximumFractionDigits: 2 })}${result.aiCalculation.leftUnit || ''}`)}
                                    />
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-500 mb-1 truncate">{result.aiCalculation.leftLabel}</p>
                                    <p className="text-xl font-black text-gray-900">
                                      {result.aiCalculation.leftValue != null
                                        ? result.aiCalculation.leftValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })
                                        : '—'}
                                      {result.aiCalculation.leftUnit || ''}
                                    </p>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-500 mb-1 truncate">{result.aiCalculation.rightLabel}</p>
                                    <p className="text-xl font-black text-gray-900">
                                      {result.aiCalculation.rightValue != null
                                        ? result.aiCalculation.rightValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })
                                        : '—'}
                                      {result.aiCalculation.rightUnit || ''}
                                    </p>
                                  </div>
                                </div>
                                {result.aiCalculation.leftValue != null && result.aiCalculation.rightValue != null
                                  && result.aiCalculation.leftValue !== 0 && (() => {
                                    const pct = ((result.aiCalculation.rightValue - result.aiCalculation.leftValue) / Math.abs(result.aiCalculation.leftValue)) * 100
                                    const up = pct >= 0
                                    return (
                                      <p className="text-xs text-gray-600">
                                        <span className="font-semibold text-gray-900">{result.aiCalculation.rightLabel}</span> is{' '}
                                        <span className={`font-bold ${up ? 'text-emerald-600' : 'text-red-600'}`}>
                                          {Math.abs(pct).toFixed(1)}% {up ? 'higher' : 'lower'}
                                        </span>{' '}
                                        than <span className="font-semibold">{result.aiCalculation.leftLabel}</span>.
                                      </p>
                                    )
                                  })()}
                              </>
                            )}
                          </>
                        ) : result.aiCalculation.error ? (
                          <p className="text-sm text-gray-500">{result.aiCalculation.answer}</p>
                        ) : result.aiCalculation.perYear ? (
                          <>
                            <p className="text-sm font-bold text-gray-800 mb-3">{result.aiCalculation.label}</p>
                            {/* Graph alongside the table for a multi-year calculation — a single
                                year stays plain data with no chart (see FocusedMetricTurn's same
                                rule); "all years"/"year wise" is what earns the trend chart,
                                with a table alongside it. */}
                            {result.aiCalculation.perYear.length > 1 && (
                              <div className="mb-3" style={{ height: 160 }}>
                                <Bar
                                  data={{
                                    labels: result.aiCalculation.perYear.map(y => y.year),
                                    datasets: [{
                                      data: result.aiCalculation.perYear.map(y => y.value),
                                      backgroundColor: '#ff7010', hoverBackgroundColor: '#1a1f36', borderRadius: 5,
                                    }],
                                  }}
                                  options={barOpts(
                                    (result.aiCalculation.unit || '').includes('%')
                                      ? (v) => `${v.toFixed(1)}%`
                                      : (v) => `${v.toLocaleString('en-IN', { maximumFractionDigits: 2 })}${result.aiCalculation.unit || ''}`,
                                    null
                                  )}
                                />
                              </div>
                            )}
                            <SimpleTable
                              headers={['Year', 'Value']}
                              rows={result.aiCalculation.perYear.map(y => ({
                                label: `FY ${y.year}`,
                                cells: [`${y.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}${result.aiCalculation.unit || ''}`],
                                colorCells: true,
                              }))}
                            />
                            <details className="text-xs text-gray-400">
                              <summary className="cursor-pointer hover:text-gray-600 select-none">Show formula for each year</summary>
                              <div className="mt-2 space-y-1.5">
                                {result.aiCalculation.perYear.map(y => (
                                  <p key={y.year} className="font-mono bg-gray-50 rounded-lg px-3 py-2 break-words">
                                    <span className="font-bold text-gray-600">FY {y.year}: </span>{y.formula}
                                  </p>
                                ))}
                              </div>
                            </details>
                          </>
                        ) : (
                          <>
                            {/* Same clean short title FocusedMetricTurn shows above its value
                                ("Total Current Assets (E)") — the single-value calc branch has
                                no dedicated short label field from the backend (only perYear
                                does), so it's derived here from the formula string by dropping
                                the embedded operand VALUES and the trailing "= result" — "Total
                                Current Assets (109.12 Mn) ÷ Total Non-current Assets (35.54 Mn)
                                = 3.07" becomes "Total Current Assets ÷ Total Non-current Assets"
                                — this title was missing here while the
                                other card format has it — both should match. */}
                            {result.aiCalculation.formula && (
                              <p className="text-sm font-bold text-gray-800 mb-1">
                                {stripAllParens(result.aiCalculation.formula.replace(/\s*=\s*[\d,.-]+.*$/, ''))}
                              </p>
                            )}
                            {result.aiCalculation.value != null && (
                              <p className={`text-2xl font-black ${valueColor(result.aiCalculation.value)}`}>
                                {result.aiCalculation.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                {result.aiCalculation.unit ? ` ${result.aiCalculation.unit}` : ''}
                              </p>
                            )}
                            {result.aiCalculation.formula && (
                              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{result.aiCalculation.formula}</p>
                            )}
                            {/* "current ratio detail"/"debt to equity build up"/etc. — the
                                numerator/denominator breakdown, same table shape and rule as
                                FocusedMetricTurn's own singleMetricGroupStatement — "current
                                ratio detail" showed no breakdown at all
                                while "EBIT detail" did — now both do. */}
                            {result.aiCalculation.detailRows?.length > 0 && (() => {
                              // "current ratio detail" (no year named) — found live: headers always used the FULL financialYears
                              // list (5 columns), but computeRatioDetail on the backend defaults
                              // to just the LATEST year (1 value) when no year was asked for —
                              // the single value landed under the FIRST year column with the
                              // other 4 blank, instead of under the latest year it actually is.
                              // Naming a year explicitly doesn't hit this (financialYears itself
                              // narrows to that one year then, so lengths already match) — only
                              // the no-year-named, defaults-to-latest case needed slicing to the
                              // trailing N years matching however many values actually came back.
                              const allYears = result.financialYears || []
                              const rowLen = result.aiCalculation.detailRows[0]?.values?.length || 0
                              const yearHeaders = rowLen === allYears.length ? allYears : allYears.slice(-rowLen)
                              return (
                                <SimpleTable
                                  headers={['Particulars', ...yearHeaders.map(yr => `FY ${yr}`)]}
                                  rows={result.aiCalculation.detailRows.map(row => ({
                                    label: cleanMetricLabel(row.label),
                                    cells: (row.values || []).map(v => v == null ? '—' : fmtMn(v, result.currencyUnit)),
                                  }))}
                                />
                              )
                            })()}
                            {/* "related party transactions" — AiCalcEngine's own bare-phrase
                                match ("related party transactions" is literally one of
                                RPT_TRANSACTION_VALUE_GROUP's synonyms in AiCalcEngine.java) wins
                                and shows the total value card above, but the backend ALSO still
                                sends the full itemized rptTable/rptBalancesTable alongside it —
                                the dedicated year-wise RPT section further down this component is
                                skipped whenever aiCalculation is set, so without this the itemized
                                party/relationship/nature list was silently dropped even though the
                                data was right there in the response —
                                "related party transactions" should show the actual transactions,
                                not just one total. "amount" arrives pipe-joined across every FY
                                in the source sheet, same convention as detailRows/ratiosTable. */}
                            {result.chartData?.rptTable?.length > 0 && (
                              <SimpleTable
                                headers={['Party', 'Relationship', 'Nature', ...(result.financialYears || []).map(yr => `FY ${yr}`)]}
                                rows={result.chartData.rptTable.map(r => ({
                                  label: r.party || r.name || '—',
                                  cells: [
                                    r.relationship || '—',
                                    r.nature || r.type || '—',
                                    ...String(r.amount || '').split('|').map(v => v.trim() || '—'),
                                  ],
                                }))}
                              />
                            )}
                            {result.chartData?.rptBalancesTable?.length > 0 && (
                              <>
                                <p className="text-xs font-bold text-gray-500 mt-4 mb-1">Balances Outstanding at Year End</p>
                                <SimpleTable
                                  headers={['Party', 'Relationship', 'Nature', ...(result.financialYears || []).map(yr => `FY ${yr}`)]}
                                  rows={result.chartData.rptBalancesTable.map(r => ({
                                    label: r.party || r.name || '—',
                                    cells: [
                                      r.relationship || '—',
                                      r.nature || r.type || '—',
                                      ...String(r.amount || '').split('|').map(v => v.trim() || '—'),
                                    ],
                                  }))}
                                />
                              </>
                            )}
                          </>
                        )}
                        {/* Same "How this was calculated"/Notes treatment FocusedMetricTurn
                            gives a plain metric lookup, applied here too regardless of which
                            aiCalculation mode is showing above (plain ratio, compareMode,
                            perYear) — found live: a calc-chain/ratio answer (e.g. "advertising
                            to sales ratio") already carries its own DSJ Insights narrative on
                            the backend, but this card never had a renderer for either field at
                            all, so it silently never showed here even though the exact same
                            content already displays for a plain single-metric lookup. */}
                        {result.computedFrom && (
                          <p className="mt-3 text-[11px] text-gray-400 leading-relaxed border-t border-gray-100 pt-2">
                            <span className="font-bold text-gray-500">How this was calculated: </span>
                            <TypewriterText instant={instant} text={result.computedFrom} start={startAt(0)} onDone={advance(0)} />
                          </p>
                        )}
                        {result.insights?.length > 0 && startAt(result.computedFrom ? 1 : 0) && (
                          <div className="mt-3 border-t border-gray-100 pt-2.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Notes</p>
                            <div className="space-y-1.5">
                              {result.insights.map((ins, i) => {
                                const stageNum = (result.computedFrom ? 1 : 0) + i
                                if (!startAt(stageNum)) return null
                                return (
                                <p key={i} className="flex items-start gap-1.5 text-xs text-gray-600 leading-relaxed">
                                  <span className="w-1 h-1 rounded-full bg-[#ff7010] flex-shrink-0 mt-1.5" />
                                  <span><TypewriterText instant={instant} text={ins} start={startAt(stageNum)} onDone={advance(stageNum)} /></span>
                                </p>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                </Reveal>

                {/* ── TOP: Premium Financial Intelligence Report — suppressed entirely
                     when a calculated answer is already showing above (see aiCalculation
                     gates throughout this block); a calculation IS the direct answer to
                     what was asked, so there's nothing left to show underneath it. ── */}
                {!result.aiCalculation && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100/60 overflow-hidden mb-5">

                  {/* ── Header — same avatar-circle shell every other response card (FocusedMetricTurn,
                       YearPromptTurn, ErrorTurn, ...) uses, so this dashboard reads as one more assistant
                       reply, not a stray data widget with no sender. Previously just a plain gray company-
                       name line with no avatar — the one card on the page still missing it. Company name +
                       "Copy all" kept exactly as before, just inside the same shell. ── */}
                  <Reveal index={1}>
                  <div className="px-6 pt-5 pb-2 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center flex-shrink-0">
                      <FaRobot className="text-[#ff7010] text-xs" />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-gray-800 truncate">{result.companyName}</p>
                      <button onClick={handleCopyAll} title="Copy the whole answer"
                        className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-colors flex-shrink-0">
                        {copiedAll ? (<><FaCheck className="text-emerald-500" /> Copied</>) : (<><FaCopy /> Copy all</>)}
                      </button>
                    </div>
                  </div>

                  {/* ── Active report type badges ── */}
                  {!result.aiCalculation && lastSearchedTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                      {lastSearchedTypes.map(id => {
                        const rt = REPORT_TYPES.find(r => r.id === id)
                        if (!rt) return null
                        const IconC = rt.Icon
                        return (
                          <span key={id} className="inline-flex items-center gap-1.5 bg-white border border-[#ff7010]/30 text-[#ff7010] text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
                            <IconC className="text-[9px]" />
                            {rt.label}
                          </span>
                        )
                      })}
                      <span className="text-[10px] text-gray-400 self-center ml-1">combined search results</span>
                    </div>
                  )}

                  {/* ── Calculation Warnings — the Formula Verification Engine recomputes
                       every row that carries an explicit formula from its own direct inputs'
                       stored values, and flags any row where the Excel-stored figure doesn't
                       match what the row's own formula says it should be. Shown prominently,
                       right at the top of the result, so a data-entry mistake in the source
                       Excel is never silently hidden behind a wrong number. ── */}
                  {!result.aiCalculation && result.calculationWarnings?.length > 0 && (
                    <div className="px-5 py-4 bg-amber-50 border-b border-amber-200"
                      style={{ animation: 'aiRevealIn 0.4s ease-out both' }}>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FaExclamationTriangle className="text-amber-600 text-xs" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black uppercase tracking-widest text-amber-800 mb-0.5">
                            Calculation Mismatch{result.calculationWarnings.length > 1 ? 'es' : ''} Found
                          </p>
                          <p className="text-[11px] text-amber-700 mb-3">
                            {result.calculationWarnings.length} row{result.calculationWarnings.length > 1 ? 's' : ''} in your uploaded Excel {result.calculationWarnings.length > 1 ? "don't" : "doesn't"} match{result.calculationWarnings.length > 1 ? '' : 'es'} what the row's own formula computes from its inputs.
                          </p>
                          <div className="space-y-2">
                            {result.calculationWarnings.map((w, i) => (
                              <div key={i} className="bg-white rounded-lg border border-amber-200 px-3.5 py-3"
                                style={{ animation: 'aiRevealIn 0.4s ease-out both', animationDelay: `${i * 0.1}s` }}>
                                <p className="text-sm font-bold text-gray-800">
                                  {w.row} <span className="font-normal text-gray-400">— {w.section}, FY {w.year}</span>
                                </p>
                                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-1.5 text-xs">
                                  <span className="text-gray-500">Excel value: <span className="font-bold text-gray-800">₹{w.excelValue?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></span>
                                  <span className="text-gray-500">Formula computes: <span className="font-bold text-emerald-700">₹{w.calculatedValue?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></span>
                                  <span className="text-gray-500">Difference: <span className="font-bold text-red-600">₹{Math.abs(w.difference)?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  </Reveal>

                  {/* ── Key metrics strip — drop raw Excel formula labels like "Profit After
                       Tax (PAT) [(C ) - (D)]", which read as technical noise rather than a
                       clean stat tile; Company Overview already covers Net Profit cleanly.
                       Skipped for "general" (plain company-name-only search) — Revenue/PAT
                       already show as normal cards inside Company Overview below, so this
                       top strip would just be the same numbers shown a second time, first. ── */}
                  <Reveal index={2}>
                  {!result.aiCalculation && !isFinancialStatementQuery && result.intent !== 'general' && (() => {
                    let cleanKeyMetrics = result.keyMetrics || []
                    // Drop the PBT/PAT bottom-line metrics specifically when they're just
                    // incidental extras in a general search — but not when the query is
                    // ITSELF asking for profit after/before tax (or any other single
                    // metric), which must still show its own number.
                    if (!singleMetricMode) {
                      cleanKeyMetrics = cleanKeyMetrics.filter(m => !/extraordinary/i.test(m.label) && !/\(pbt\)/i.test(m.label) && !/\(pat\)/i.test(m.label))
                    }
                    // Strip the "[(ix)=(i)-(iv)]"-style formula noise from the label but
                    // keep the metric itself.
                    cleanKeyMetrics = cleanKeyMetrics.map(m => ({ ...m, label: m.label.replace(/\s*\[[^\]]*\]\s*/g, ' ').replace(/\s+/g, ' ').trim() }))
                    // A single-metric search (EBITDA/EBIT/Gross Margin/PAT/...) shows only
                    // that metric's tile, not the others alongside it.
                    if (singleMetricConfig) cleanKeyMetrics = cleanKeyMetrics.filter(m => singleMetricConfig.labelTest.test(m.label.trim()))
                    return cleanKeyMetrics.length > 0 && (
                    <div className={`grid divide-x divide-gray-100 ${cleanKeyMetrics.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
                      {cleanKeyMetrics.slice(0, 4).map((m, i) => {
                        const accentColors  = ['#1a1f36','#6366f1','#3b82f6','#ff7010']
                        const bgTints       = ['bg-slate-50/70','bg-indigo-50/70','bg-blue-50/70','bg-orange-50/70']
                        const accent        = accentColors[i % 4]
                        const isUp   = m.trend === 'up'
                        const isDown = m.trend === 'down'
                        return (
                          <div key={i} className={`relative px-5 py-4 ${bgTints[i % 4]} group`}
                            style={{ animation: 'aiRevealIn 0.4s ease-out both', animationDelay: `${i * 0.08}s` }}>
                            {/* colored top bar */}
                            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-b-none" style={{background: accent}} />
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2 leading-tight truncate">{m.label}</p>
                            <p className="text-2xl font-black leading-none mb-1.5" style={{color: accent}}>{m.value}</p>
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isUp   ? 'bg-green-100 text-green-700'
                            : isDown ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-500'
                            }`}>
                              {isUp ? '▲' : isDown ? '▼' : '—'} YoY
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    )
                  })()}
                  </Reveal>

                  {/* ── Company Overview — shown for a general search, pulls together data
                       that already exists elsewhere on the page (balance sheet, ratios,
                       burn/ads metrics, RPT, insights) into one at-a-glance snapshot.
                       Skipped for an explicit "financial statement" search, which shows
                       only the statements themselves, for an "ebitda"-intent search (bare
                       "EBITDA"/"EBITDA detail", or "EBIT" via singleMetricMode), and for this
                       specific, individually-verified list of narrow intents that each already
                       have their own dedicated section further down (expense/margin get the P&L
                       or Margin Analysis statement + charts, capTable/rpt get their own
                       shareholder/RPT tables) — every one confirmed live to still render real
                       content without this snapshot. Deliberately NOT a general "any narrow
                       topic" rule keyed on summary/analysis being null (tried that — it broke
                       coverage for many already-trained keywords: several other narrow-intent keywords relied on THIS generic
                       snapshot as their only real content and went blank when it was hidden
                       unconditionally; reverted to this explicit, narrow safelist so anything
                       not on it keeps behaving exactly as before). Checked on result.intent
                       (the backend's own classification) rather than re-testing the query text,
                       since that's already authoritative and query-text regexes here have
                       caused this exact class of bug before (see SINGLE_METRIC_MATCHERS). ── */}
                  <Reveal index={3}>
                  {!result.aiCalculation && !isFinancialStatementQuery && !singleMetricMode && result.intent !== 'ebitda'
                    && !['expense', 'margin', 'capTable', 'rpt'].includes(result.intent) && (() => {
                    const meta = result.companyMeta || {}
                    const cd   = result.chartData || {}

                    // No trailing $ anchor — real Excel labels carry formula suffixes like
                    // "Total Revenue (A)" that cleanStatementLabel doesn't strip (only "[...]"
                    // is stripped, not "(...)"), so an exact-match regex silently matched nothing.
                    const revenueOpsRow  = findStatementRow(cd.profitLossStatement, l => /^revenue from operations?\b/i.test(l))
                    const totalRevRow    = findStatementRow(cd.profitLossStatement, l => /^total revenue\b/i.test(l) || /^total income\b/i.test(l))
                    const totalAssetsRow = findStatementRow(cd.balanceSheetStatement, l => /^total assets/i.test(l))
                    const totalLiabRow   = findStatementRow(cd.balanceSheetStatement, l => /^total liabilities/i.test(l))
                    const shareCapRow    = findStatementRow(cd.balanceSheetStatement, l => /^share capital$/i.test(l))
                    const reservesRow    = findStatementRow(cd.balanceSheetStatement, l => /^reserves and surplus$/i.test(l))
                    const ocfRow         = findStatementRow(cd.cashFlowStatement, l => /^net cash generated.*operating/i.test(l))

                    const marginLatest = latestArrValue(cd.marginChart)
                    const patLatest    = latestArrValue(cd.profitChart)

                    const burnRow = findChartRow(cd.burnMetricsChart, l => /gross burn rate/i.test(l) && /total|annual/i.test(l))
                    const adsRow  = findChartRow(cd.adsMetricsChart,  l => /advertisement.*expense/i.test(l))

                    const rptRows = cd.rptTable || []

                    const snapshotStats = [
                      totalAssetsRow && { label: 'Total Assets',       value: fmtMn(latestArrValue(totalAssetsRow.values), result.currencyUnit) },
                      totalLiabRow   && { label: 'Total Liabilities',  value: fmtMn(latestArrValue(totalLiabRow.values), result.currencyUnit) },
                      reservesRow    && { label: 'Reserves & Surplus', value: fmtMn(latestArrValue(reservesRow.values), result.currencyUnit) },
                      patLatest?.value != null           && { label: 'Net Profit',        value: fmtMn(patLatest.value, result.currencyUnit) },
                      marginLatest?.grossMargin  != null && { label: 'Gross Margin',      value: `${marginLatest.grossMargin.toFixed(1)}%` },
                      marginLatest?.ebitdaMargin != null && { label: 'EBITDA Margin',     value: `${marginLatest.ebitdaMargin.toFixed(1)}%` },
                      revenueOpsRow  && { label: 'Revenue from Operations', value: fmtMn(latestArrValue(revenueOpsRow.values), result.currencyUnit) },
                      totalRevRow    && { label: 'Total Revenue',      value: fmtMn(latestArrValue(totalRevRow.values), result.currencyUnit) },
                      ocfRow         && { label: 'Cash Flow from Ops', value: fmtMn(latestArrValue(ocfRow.values), result.currencyUnit) },
                    ].filter(Boolean)

                    const burnStats = [
                      burnRow && { label: 'Annual Gross Burn Rate', value: fmtMn(burnRow.latest, result.currencyUnit) },
                      adsRow  && { label: 'Advertisement Cost', value: fmtMn(adsRow.latest, result.currencyUnit) },
                    ].filter(Boolean)

                    const hasCompanyInfo = meta.ceo || meta.incorporationDate || meta.boardOfDirectors?.length ||
                      meta.investors?.length || result.industry || result.cin
                    // Key Highlights deliberately excluded from this snapshot -- the dedicated
                    // Key Highlights section further down (result.insights, unconditional on
                    // intent) already covers it for every query, so including it here too only
                    // ever produced a second, truncated (this box has no height for the full
                    // text) copy of the exact same bullets stacked right above the real one.
                    // Found live via "burn rate 2023-24": both showed, one cut off mid-word.
                    // ROE/ROIC/ROCE (ratioStats) removed the same way, for the same reason --
                    // the full Ratio Analysis widget further down already shows every ratio
                    // (with its own formula + significance), so this box was showing ROE
                    // TWICE on the same page in two different units (32.0% here vs the plain
                    // 0.32 the ratio widget itself shows) -- the same number, visibly
                    // inconsistent, not just redundant. Found live via a "ROE 2023-24" query.
                    const hasAnyOverview = hasCompanyInfo || snapshotStats.length ||
                      burnStats.length || rptRows.length > 0
                    if (!hasAnyOverview) return null

                    return (
                      <div className="border-t border-gray-100 px-4 py-4">
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-4">

                          {/* company info */}
                          {hasCompanyInfo && (
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                                {result.cin && (
                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">CIN No.</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">{result.cin}</p>
                                  </div>
                                )}
                                {result.financialYears?.length > 0 && (
                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Latest Year</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">FY {result.financialYears[result.financialYears.length - 1]}</p>
                                  </div>
                                )}
                                {result.industry && (
                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Industry</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">{result.industry}</p>
                                  </div>
                                )}
                                {meta.incorporationDate && (
                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Date of Incorporation</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">{meta.incorporationDate}</p>
                                  </div>
                                )}
                                {meta.ceo && (
                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">CEO / MD</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">{meta.ceo}</p>
                                  </div>
                                )}
                              </div>
                              {meta.boardOfDirectors?.length > 0 && (
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Board of Directors</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {meta.boardOfDirectors.map((name, i) => (
                                      <span key={i} className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-full">{name}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* Investor names list dropped here — it duplicated the same names
                                  shown with real context (category/shares/%) in the Shareholding
                                  Pattern / Preference Shareholders tables further down. */}
                              {shareCapRow && (
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Share Capital</p>
                                  <p className="text-sm font-bold text-gray-900 mt-0.5">{fmtMn(latestArrValue(shareCapRow.values), result.currencyUnit)}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* financial snapshot */}
                          {snapshotStats.length > 0 && (
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Financial Snapshot</p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {snapshotStats.map((s, i) => <OverviewStat key={i} {...s} delay={i * 0.05} />)}
                              </div>
                            </div>
                          )}

                          {/* burn & marketing */}
                          {burnStats.length > 0 && (
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Burn & Marketing</p>
                              <div className="grid grid-cols-2 gap-2">
                                {burnStats.map((s, i) => <OverviewStat key={i} {...s} delay={i * 0.05} />)}
                              </div>
                            </div>
                          )}

                          {/* related party transactions */}
                          {rptRows.length > 0 && (
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Related Party Transactions</p>
                              <div className="space-y-1.5">
                                {rptRows.slice(0, 3).map((r, i) => (
                                  <div key={i} className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-3 py-2">
                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold text-gray-800 truncate">{r.party}</p>
                                      {r.nature && <p className="text-[10px] text-gray-400 truncate">{r.nature}</p>}
                                    </div>
                                    <p className="text-xs font-bold text-gray-900 flex-shrink-0">{fmtMn(latestPipeNum(r.amount), result.currencyUnit)}</p>
                                  </div>
                                ))}
                                {rptRows.length > 3 && (
                                  <p className="text-[10px] text-gray-400">+{rptRows.length - 3} more — search "related party transactions" for the full list</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  {/* ════════════════════════════════════════════════════
                       CHART DASHBOARD
                  ════════════════════════════════════════════════════ */}
                  {!result.aiCalculation && !isFinancialStatementQuery && result.chartData && (() => {
                    const cd = result.chartData

                    // ── Year filter ──
                    const allFyYears = result.financialYears || []
                    const activeIdxs = selectedYears.length > 0
                      ? [...selectedYears].sort((a, b) => a - b)
                      : allFyYears.map((_, i) => i)
                    // String-based: d.year comes from same Java list as financialYears → exact match
                    const activeYrStrs = new Set(activeIdxs.map(i => allFyYears[i]).filter(Boolean))
                    // Shareholder/Cap Table data is a single point-in-time snapshot with no year
                    // field of its own (unlike every other section here) — it reflects whatever
                    // the source Excel's cap table sheet was "as on", which in practice is always
                    // the model's latest financial year. Showing it unchanged when the user has
                    // filtered to an EARLIER year would silently pass off a 2024 shareholder list
                    // as if it were the answer for FY2018-19 — so it's suppressed instead whenever
                    // the latest year isn't part of the active selection.
                    const latestFy = allFyYears[allFyYears.length - 1]
                    const shareholderYearMismatch = selectedYears.length > 0 && latestFy && !activeYrStrs.has(latestFy)
                    const filterYr = (arr) => {
                      if (!arr) return []
                      if (activeYrStrs.size === 0 || selectedYears.length === 0) return arr
                      return arr.filter(d => d.year && activeYrStrs.has(String(d.year)))
                    }

                    // ── Table format, same look as "Financials at a Glance", used above the
                    // Revenue/Profit/EBITDA/Cash-Flow charts below so every headline number
                    // shows as a table (not just a graph) — not just for single-metric mode.
                    const yrsForTables = activeIdxs.map(i => allFyYears[i]).filter(Boolean)
                    const valueForYear = (arr, yr, key = 'value') => {
                      const found = (arr || []).find(d => String(d.year) === String(yr))
                      return found ? found[key] : null
                    }
                    // Chart tooltip helper — % of Revenue for the same year, from the
                    // company's own Revenue series, never a fixed/assumed ratio.
                    const pctOfRevFn = (revSeries) => (v, yr) => {
                      const rev = valueForYear(revSeries, yr)
                      return (v != null && rev != null && rev !== 0) ? `${(v / rev * 100).toFixed(1)}%` : null
                    }
                    // Y-o-Y column count follows how many years are on the table — none for a
                    // single year (nothing to compare), one for two years, one per consecutive
                    // pair for more (e.g. 5 years selected → 4 pair columns), never a single
                    // first-vs-last change spanning the whole selection.
                    // YoY sits stacked inside the same year's value cell (below "% of Rev"),
                    // not as its own separate column — with 3-5 years on screen a whole extra
                    // YoY column per pair made the table sprawl sideways; this keeps one column
                    // per FY like a normal statement table while still surfacing the trend.
                    const renderYoyTable = (years, rows) => rows.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse rounded-xl overflow-hidden">
                          <thead>
                            <tr className="bg-gray-900">
                              <th className="text-left py-3 px-4 min-w-[180px] text-[11px] font-bold text-white/80 whitespace-nowrap">Particulars</th>
                              {years.map(yr => (
                                <th key={yr} className="text-right py-3 px-4 min-w-[110px] text-[11px] font-bold text-white/80 whitespace-nowrap">FY {yr}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row, i) => (
                              <tr key={i} className="border-b border-gray-100">
                                <td className="py-3 px-4 min-w-[180px] whitespace-nowrap text-gray-700 text-xs font-semibold">{row.label}</td>
                                {row.values.map((v, j) => {
                                  const pair = j > 0 ? row.yoySeries?.[j - 1] : null
                                  return (
                                    <td key={j} className="py-3 px-4 min-w-[110px] whitespace-nowrap text-right text-xs text-gray-800 tabular-nums font-bold">
                                      {v}
                                      <span className={`block w-fit ml-auto px-1.5 py-0.5 rounded-md text-[9px] font-black mt-1 ${!pair ? 'invisible' :
                                          pair.yoyPositive === true  ? 'bg-green-50 text-green-700'
                                        : pair.yoyPositive === false ? 'bg-red-50 text-red-600'
                                        : 'bg-gray-50 text-gray-400'
                                        }`}>{pair ? `${pair.yoy} YoY` : '—'}</span>
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )

                    // Single-metric mode (EBITDA/EBIT/etc.) respects the same year filter as
                    // every other chart here, and feeds both the table row below and the bar chart.
                    const smSeries = filterYr(singleMetricConfig?.series || [])
                    const smYoyRow = singleMetricConfig && smSeries.length > 0
                      ? buildYoyRow(singleMetricConfig.title, smSeries.map(d => d.value), singleMetricConfig.fmt,
                          singleMetricConfig.isCurrency ? smSeries.map(d => valueForYear(cd.revenueChart, d.year)) : null)
                      : null

                    const revData  = filterYr(cd.revenueChart  || []).filter(d => d.value != null)
                    const patData  = filterYr(cd.profitChart   || []).filter(d => d.value != null)
                    const ebiData  = filterYr(cd.ebitdaChart   || []).filter(d => d.value != null)
                    const margData = filterYr(cd.marginChart   || []).filter(d => Object.keys(d).length > 1)
                    const grwData  = filterYr(cd.growthChart   || [])
                    // cashFlowChart is a 3-line Operating/Investing/Financing SUMMARY of the
                    // same data the full cashFlowStatement below already shows in complete
                    // detail — found live: an outdated version of the cash flow statement was
                    // showing up. Asking for the cash flow statement showed this condensed summary
                    // card AND the full itemized statement together, the summary reading as a
                    // stale/older view sitting above the real one. Same "richer view wins"
                    // precedent as the Overhead Costs *Chart vs *Statement fix — only suppressed
                    // when the full statement is ALSO present; a general company-overview search
                    // (which never shows the full raw statement) still gets this summary as its
                    // only cash-flow view, unaffected.
                    const cfData   = cd.cashFlowStatement?.length > 0 ? [] : filterYr(cd.cashFlowChart || [])
                    const rveData  = filterYr(cd.revVsExpChart || [])

                    // Table rows for Revenue/PAT/EBITDA/Cash-Flow — built against yrsForTables
                    // (not revData/patData/etc., which drop null years) so every row lines up
                    // under the same FY columns even when one metric has a gap another doesn't.
                    const revSeriesForTables = yrsForTables.map(yr => valueForYear(cd.revenueChart, yr))
                    const revPatRows = [
                      revData.length > 0 && buildYoyRow('Revenue',           yrsForTables.map(yr => valueForYear(cd.revenueChart, yr)), (v) => fmtMn(v, result.currencyUnit), revSeriesForTables),
                      patData.length > 0 && buildYoyRow('Net Profit / PAT',  yrsForTables.map(yr => valueForYear(cd.profitChart,  yr)), (v) => fmtMn(v, result.currencyUnit), revSeriesForTables),
                    ].filter(Boolean)
                    const ebitdaRows = ebiData.length > 0
                      ? [buildYoyRow('EBITDA', yrsForTables.map(yr => valueForYear(cd.ebitdaChart, yr)), (v) => fmtMn(v, result.currencyUnit), revSeriesForTables)].filter(Boolean)
                      : []
                    const cashFlowRows = cfData.length > 0 ? [
                      cfData[0]?.operating !== undefined && buildYoyRow('Operating Cash Flow', yrsForTables.map(yr => valueForYear(cd.cashFlowChart, yr, 'operating')), (v) => fmtMn(v, result.currencyUnit), revSeriesForTables),
                      cfData[0]?.investing !== undefined && buildYoyRow('Investing Cash Flow', yrsForTables.map(yr => valueForYear(cd.cashFlowChart, yr, 'investing')), (v) => fmtMn(v, result.currencyUnit), revSeriesForTables),
                      cfData[0]?.financing !== undefined && buildYoyRow('Financing Cash Flow', yrsForTables.map(yr => valueForYear(cd.cashFlowChart, yr, 'financing')), (v) => fmtMn(v, result.currencyUnit), revSeriesForTables),
                    ].filter(Boolean) : []
                    const expBk    = cd.expenseBreakdown
                    const astBk    = cd.assetBreakdown
                    const capBk    = cd.capitalStructure
                    // ── intent-specific rich data ──
                    const shareholderPie  = cd.shareholderPieChart     // {name: pct%}
                    const shareholderRows = cd.shareholderTable         // [{name,category,shares,percentage}]
                    const prefRows        = cd.preferenceShareholderTable
                    const prefPie         = cd.preferenceShareholderPieChart  // {name: pct%}
                    const prefCaption     = cd.preferenceShareholderCaption   // verbatim Excel section title, e.g. "Compulsorily Convertible Preference Shares (CCPS) shareholding structure as on 31 March 2024"
                    const shareholderYearPanels = cd.shareholderYearPanels   // "shareholder all"/"year wise" — [{year, shareholderTable, shareholderPieChart, preferenceShareholderTable, preferenceShareholderPieChart, preferenceShareholderCaption}], one entry per FY that has its own cap-table block on record
                    const rptRows         = cd.rptTable                 // [{party,relationship,nature,amount}]
                    const rptBalRows      = cd.rptBalancesTable
                    const ratiosRows      = cd.ratiosTable              // [{category,name,formula,value,significance}]
                    // Each *Chart key is the OLDER, simpler render (no Total row, no Y-o-Y, no
                    // % of Revenue) of the exact same box the newer "Financial" section below
                    // renders from the matching *Statement key (Total row included, richer
                    // formatting) — found live: "other expenses"/"advertisement
                    // cost" showed the SAME data TWICE on the page, once in each format, because
                    // both sections' own gates fire together for an expense-topic query. Only
                    // falls back to the older Chart rows when the richer Statement isn't present
                    // at all (so nothing regresses for whatever narrower case still relies on
                    // just the Chart key) — the *Statement version wins whenever both exist.
                    const burnRows        = cd.burnMetricsStatement?.length > 0 ? null : cd.burnMetricsChart
                    const empRows         = cd.employeeExpensesStatement?.length > 0 ? null : cd.employeeExpChart
                    const otherExpRows    = cd.otherExpensesStatement?.length > 0 ? null : cd.otherExpChart
                    const adsRows         = cd.adsMetricsStatement?.length > 0 ? null : cd.adsMetricsChart

                    // ── Intent-gated visibility ──
                    // If user clicked Analyze with specific types → use those; else fall back to backend intent
                    const intent   = result.intent || 'general'
                    const searched = lastSearchedTypes  // types chosen in Analyze panel
                    const hasSearchedTypes = searched.length > 0

                    // "general" (plain company-name-only search, no topic asked) is deliberately
                    // excluded here — that case should show just the Company Overview snapshot
                    // above, not the full Revenue/Profit/EBITDA chart dashboard too.
                    const wantsFinancials = hasSearchedTypes
                      ? searched.includes('financialStatements')
                      : ['revenue','profit','ebitda','cashflow','balance','expense','margin','trend'].includes(intent)
                    const wantsRpt      = hasSearchedTypes ? searched.includes('rpt')             : intent === 'rpt'
                    const wantsRatios   = hasSearchedTypes ? searched.includes('investorMetrics') : intent === 'investorMetrics'
                    const wantsOverhead = hasSearchedTypes ? searched.includes('overheadCosts')   : intent === 'overheadCosts' || intent === 'expense'

                    const showFinancials = wantsFinancials
                    const showRpt        = wantsRpt
                    const showRatios     = wantsRatios
                    const showOverhead   = wantsOverhead
                    const showDoughnuts  = wantsFinancials || wantsOverhead

                    const DONUT_COLORS = ['#1a1f36','#6366f1','#ff7010','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4']
                    const mkDoughnut  = (obj) => ({
                      labels: Object.keys(obj),
                      datasets: [{ data: Object.values(obj), backgroundColor: DONUT_COLORS, borderWidth: 2, borderColor: '#fff', hoverOffset: 8 }]
                    })
                    // Full-statement tables (Balance Sheet/P&L/Cash Flow/Margin Analysis/Burn
                    // Metrics/Employee & Other Expenses, plus the "Financials at a Glance"
                    // summary) render as their OWN separate block further below, gated on
                    // showFinancials rather than any of the chart-summary values above — a query
                    // whose intent only ever populates one of THESE (e.g. "trade payable" ->
                    // only balanceSheetStatement) left every other anySectionData input empty,
                    // so the "no chart data for the selected year(s)" banner fired right above a
                    // table that was, in fact, fully populated. Found live: real Trade Payables
                    // data rendered correctly, with a misleading "No chart data available" banner
                    // sitting directly above it.
                    const hasFullStatementData = Boolean(
                      cd.tableData?.length || cd.balanceSheetStatement?.length || cd.profitLossStatement?.length ||
                      cd.cashFlowStatement?.length || cd.marginAnalysisStatement?.length || cd.burnMetricsStatement?.length ||
                      cd.employeeExpensesStatement?.length || cd.otherExpensesStatement?.length || cd.adsMetricsStatement?.length
                    )
                    const anySectionData = revData.length || patData.length || margData.length || grwData.length || cfData.length || expBk || astBk || capBk || hasFullStatementData

                    // ── Always-available doughnut datasets ──
                    // 1. Revenue by Year — each slice = one FY
                    const revByYearObj = {}
                    revData.forEach(d => { if (d.value != null && d.value > 0) revByYearObj[`FY ${d.year}`] = d.value })

                    // 2. Earnings snapshot (latest year) — PAT + (Revenue - PAT)
                    const lastRev = revData.length ? revData[revData.length - 1]?.value : null
                    const lastPat = patData.length ? patData[patData.length - 1]?.value : null
                    const lastEbi = ebiData.length ? ebiData[ebiData.length - 1]?.value : null
                    const earningsObj = {}
                    if (lastRev != null && lastRev > 0) {
                      if (lastPat != null && lastPat > 0)  earningsObj['Net Profit'] = lastPat
                      if (lastEbi != null && lastEbi > 0 && lastEbi !== lastPat)  earningsObj['EBITDA (excl. PAT)'] = Math.max(0, lastEbi - (lastPat ?? 0))
                      const remainder = lastRev - Math.max(lastPat ?? 0, 0) - Math.max((lastEbi != null && lastEbi !== lastPat) ? Math.max(0, lastEbi - (lastPat ?? 0)) : 0, 0)
                      if (remainder > 0) earningsObj['Operating Costs'] = remainder
                    }

                    // 3. PAT by Year — each slice = one FY's profit (only positive values)
                    const patByYearObj = {}
                    patData.forEach(d => { if (d.value != null && d.value > 0) patByYearObj[`FY ${d.year}`] = d.value })

                    const hasRevByYear   = Object.keys(revByYearObj).length > 1
                    const hasEarnings    = Object.keys(earningsObj).length >= 2
                    const hasPatByYear   = Object.keys(patByYearObj).length > 1

                    // Non-year-keyed sections (Cap Table, RPT, Ratios) are never filtered by
                    // selectedYears (see filterYr above) — if any of them have data, the "no
                    // chart data for the selected year(s)" banner would be misleading noise
                    // sitting above a perfectly populated shareholder/RPT/ratios section below it.
                    const hasNonYearSectionData = Boolean((!shareholderYearMismatch && (shareholderPie || shareholderRows?.length || prefRows?.length)) || shareholderYearPanels?.length || rptRows?.length || ratiosRows?.length)
                    const hasSingleMetricData = Boolean(singleMetricConfig?.series?.length)
                    const noDataForFilter = selectedYears.length > 0 && !anySectionData && !hasRevByYear && !hasNonYearSectionData && !hasSingleMetricData
                    if (!anySectionData && !hasRevByYear && !hasNonYearSectionData && !hasSingleMetricData && selectedYears.length === 0) return null
                    return (<>

                      {/* ── Year picker — click FY chips to filter the whole result to those
                           years, no need to type years into the search box. (Older years before
                           the earliest one with financial data aren't offered here — this
                           company's incorporation date isn't on record, so there's no reliable
                           way to know how far back to go.) ── */}
                      {/* {allFyYears.length > 1 && (
                        <div className="mx-4 mt-4 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-1">Years</span>
                          {allFyYears.map((yr, i) => {
                            const active = selectedYears.includes(i)
                            return (
                              <button key={yr}
                                onClick={() => setSelectedYears(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i].sort((a, b) => a - b))}
                                className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-colors ${
                                  active ? 'bg-[#ff7010] border-[#ff7010] text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
                                }`}>
                                FY {yr}
                              </button>
                            )
                          })}
                        </div>
                      )} */}

                      {/* ── Year filter banner ── */}
                      {selectedYears.length > 0 && (
                        <div className="mx-4 mt-4 flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff7010] flex-shrink-0" />
                          <p className="text-[11px] font-semibold text-orange-700 flex-1">
                            Showing data for: {activeIdxs.map(i => allFyYears[i]).filter(Boolean).map(yr => `FY ${yr}`).join(', ')}
                          </p>
                          <button onClick={() => setSelectedYears([])} className="text-[10px] font-black text-[#ff7010] hover:underline flex-shrink-0">Clear</button>
                        </div>
                      )}

                      {/* No chart data for selected year */}
                      {noDataForFilter && (
                        <div className="mx-4 mt-3 mb-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-center">
                          <p className="text-sm text-gray-500">No chart data available for the selected year(s).</p>
                          <button onClick={() => setSelectedYears([])} className="mt-2 text-[11px] font-bold text-[#ff7010] hover:underline">Show all years</button>
                        </div>
                      )}

                      {/* Cap table data is a single latest-year snapshot only, no year field of
                          its own on record — whether it's equity or preference/CCPS. Showing
                          the current snapshot for an EARLIER year asked would claim to answer
                          that year when it can't (a past year's real headcount/shareholding may
                          have genuinely differed) — "give exactly the year asked, nothing
                          substituted" applies here just like everywhere else, so BOTH equity and
                          preference are suppressed together whenever the selected year(s) don't
                          include the snapshot's own (latest) year, not just preference.
                          Gated on intent === 'capTable' (not on shareholderPie/shareholderRows/
                          prefRows existing) because the backend now strips ALL of those chartData
                          keys outright for a year mismatch — checking for their presence here
                          would never fire, silently dropping this explanation along with the
                          data it's explaining. */}
                      {!singleMetricMode && shareholderYearMismatch && intent === 'capTable' && (
                        <div className="mx-4 mt-4 mb-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-center">
                          <p className="text-xs text-amber-700">
                            Shareholder/Cap Table data on record is only as of FY {latestFy} (a single snapshot, not year-by-year) — not available for the selected year(s).
                          </p>
                        </div>
                      )}

                      {/* ── Cap Table: Shareholder Pie + Table — shown whenever the company
                           has shareholding data on record, not gated behind an explicit Cap
                           Table search, so it appears on the general overview too. ── */}
                      {/* prefRows included in this gate too — found live: "preference
                          shareholder" now returns ONLY preferenceShareholderTable (no equity
                          shareholderPie/shareholderTable, by design — see the capTable
                          share-type filter), but this block used to require equity data just
                          to mount at all, so the preference table nested inside it (further
                          below) never rendered and the search showed nothing. */}
                      {!singleMetricMode && !shareholderYearMismatch && (shareholderPie || shareholderRows?.length > 0 || prefRows?.length > 0) && (() => {
                        // Category filter chips — click to narrow the already-loaded table/pie
                        // to one investor type (Founder, Angel Investor, VC, ...) without a new
                        // search. Options are whatever categories this company's own data has.
                        const shCategories = [...new Set((shareholderRows || []).map(r => r.category).filter(Boolean))]
                        const filteredShareholderRows = shCategoryFilter
                          ? (shareholderRows || []).filter(r => r.category === shCategoryFilter)
                          : (shareholderRows || [])
                        const filteredShareholderPie = shCategoryFilter && shareholderPie
                          ? Object.fromEntries(Object.entries(shareholderPie).filter(([name]) =>
                              filteredShareholderRows.some(r => r.name === name)))
                          : shareholderPie
                        return (
                        <div className="border-t border-gray-100 bg-gradient-to-br from-indigo-50/30 to-white px-4 py-5"
                          style={{ animation: 'aiRevealIn 0.4s ease-out both' }}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                              <FaUsers className="text-indigo-500 text-xs" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">Shareholding Pattern</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {shareholderRows?.length > 0 && prefRows?.length > 0
                                  ? 'Equity + Preference cap table — all shareholders'
                                  : prefRows?.length > 0
                                  ? 'Preference cap table'
                                  : 'Equity cap table — all shareholders'}
                              </p>
                            </div>
                          </div>

                          {shCategories.length > 1 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              <button onClick={() => setShCategoryFilter(null)}
                                className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-colors ${
                                  !shCategoryFilter ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                                }`}>
                                All ({shareholderRows.length})
                              </button>
                              {shCategories.map(cat => {
                                const count = shareholderRows.filter(r => r.category === cat).length
                                return (
                                  <button key={cat} onClick={() => setShCategoryFilter(cat)}
                                    className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-colors ${
                                      shCategoryFilter === cat ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                                    }`}>
                                    {cat} ({count})
                                  </button>
                                )
                              })}
                            </div>
                          )}

                          <div className={`grid gap-4 ${filteredShareholderPie && filteredShareholderRows?.length > 0 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                            {/* Pie chart */}
                            {filteredShareholderPie && (() => {
                              const labels = Object.keys(filteredShareholderPie)
                              const vals   = Object.values(filteredShareholderPie)
                              return (
                                <div className="bg-white rounded-2xl shadow-md border border-indigo-100 overflow-hidden">
                                  <div className="h-1 bg-gradient-to-r from-indigo-500 to-indigo-300" />
                                  <div className="p-4">
                                    <p className="text-xs font-bold text-gray-800 mb-0.5">Equity Shareholding</p>
                                    <p className="text-[10px] text-gray-400 mb-3">% share distribution</p>
                                    <div style={{height: 240, width: '100%', position: 'relative'}}>
                                      <Doughnut data={{
                                        labels,
                                        datasets: [{ data: vals, backgroundColor: DONUT_COLORS, borderWidth: 3, borderColor: '#fff', hoverOffset: 10 }]
                                      }} options={{
                                        ...doughnutOpts(result.currencyUnit),
                                        cutout: '55%',
                                        plugins: {
                                          legend: { position: 'bottom', labels: { font:{size:10,weight:'600'}, color:'#6b7280', boxWidth:9, boxHeight:9, usePointStyle:true, pointStyle:'circle', padding:8 } },
                                          tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.raw}%` }, backgroundColor:'#1a1f36', padding:10, cornerRadius:8 }
                                        }
                                      }} />
                                    </div>
                                  </div>
                                </div>
                              )
                            })()}

                            {/* Shareholder table */}
                            {filteredShareholderRows?.length > 0 && (() => {
                              const numOf = (v) => { const n = parseFloat(String(v ?? '').replace(/[,%]/g, '')); return Number.isFinite(n) ? n : 0 }
                              const totalShares = filteredShareholderRows.reduce((sum, r) => sum + numOf(r.shares), 0)
                              const totalPct    = filteredShareholderRows.reduce((sum, r) => sum + numOf(r.percentage), 0)
                              return (
                              <div className="bg-white rounded-2xl shadow-md border border-indigo-100 overflow-hidden">
                                <div className="h-1 bg-gradient-to-r from-indigo-600 to-purple-400" />
                                <div className="p-4 overflow-x-auto">
                                  <p className="text-xs font-bold text-gray-800 mb-0.5">Equity Shareholders</p>
                                  <p className="text-[10px] text-gray-400 mb-3">{filteredShareholderRows.length} shareholders on record</p>
                                  <table className="w-full border-collapse text-xs">
                                    <thead>
                                      <tr className="bg-gray-900">
                                        <th className="text-left py-2.5 px-3 text-white/80 font-bold text-[11px]">Shareholder</th>
                                        <th className="text-left py-2.5 px-3 text-white/80 font-bold text-[11px]">Category</th>
                                        <th className="text-right py-2.5 px-3 text-white/80 font-bold text-[11px]">Shares</th>
                                        <th className="text-right py-2.5 px-3 text-[#ff7010] font-bold text-[11px]">%</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filteredShareholderRows.map((r, i) => (
                                        <tr key={i} className={`border-b border-gray-100 hover:bg-indigo-50/30 transition-colors ${i%2===1?'bg-gray-50/50':''}`}>
                                          <td className="py-2.5 px-3 font-semibold text-gray-800 max-w-[160px] truncate">{r.name}</td>
                                          <td className="py-2.5 px-3 text-gray-500">{r.category || '—'}</td>
                                          <td className="py-2.5 px-3 text-right tabular-nums text-gray-700 font-medium">{r.shares || '—'}</td>
                                          <td className="py-2.5 px-3 text-right tabular-nums font-black text-indigo-600">
                                            <span className="bg-indigo-50 px-2 py-0.5 rounded-md">{r.percentage || '—'}</span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot>
                                      <tr className="border-t-2 border-gray-800">
                                        <td colSpan={2} className="py-2.5 px-3 font-black text-gray-900">Total</td>
                                        <td className="py-2.5 px-3 text-right tabular-nums font-black text-gray-900">{totalShares.toLocaleString('en-IN')}</td>
                                        <td className="py-2.5 px-3 text-right tabular-nums font-black text-indigo-700">
                                          <span className="bg-indigo-100 px-2 py-0.5 rounded-md">{totalPct.toFixed(2)}%</span>
                                        </td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              </div>
                              )
                            })()}
                          </div>

                          {/* Preference shareholders — same category filter chips as Equity above,
                              plus its own pie chart mirroring the Equity one. Heading uses the
                              actual Excel section caption when the source workbook had one on
                              record (e.g. "...CCPS shareholding structure as on 31 March 2024") —
                              the only "as on <date>" hint available, since cap table data has no
                              year field otherwise. (shareholderYearMismatch already gates the
                              WHOLE section above this point — both equity and preference are
                              suppressed together, not just this part.) */}
                          {prefRows?.length > 0 && (() => {
                            const prefCategories = [...new Set(prefRows.map(r => r.category).filter(Boolean))]
                            const filteredPrefRows = prefCategoryFilter
                              ? prefRows.filter(r => r.category === prefCategoryFilter)
                              : prefRows
                            const filteredPrefPie = prefCategoryFilter && prefPie
                              ? Object.fromEntries(Object.entries(prefPie).filter(([name]) =>
                                  filteredPrefRows.some(r => r.name === name)))
                              : prefPie
                            const numOf = (v) => { const n = parseFloat(String(v ?? '').replace(/[,%]/g, '')); return Number.isFinite(n) ? n : 0 }
                            const totalPrefShares = filteredPrefRows.reduce((sum, r) => sum + numOf(r.shares), 0)
                            const totalPrefPct    = filteredPrefRows.reduce((sum, r) => sum + numOf(r.percentage), 0)
                            return (
                            <div className="mt-4">
                              <p className="text-xs font-bold text-gray-800 mb-0.5">{prefCaption || 'Preference Shareholders'}</p>
                              <p className="text-[10px] text-gray-400 mb-3">{filteredPrefRows.length} holder(s) on record</p>

                              {prefCategories.length > 1 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  <button onClick={() => setPrefCategoryFilter(null)}
                                    className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-colors ${
                                      !prefCategoryFilter ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300'
                                    }`}>
                                    All ({prefRows.length})
                                  </button>
                                  {prefCategories.map(cat => {
                                    const count = prefRows.filter(r => r.category === cat).length
                                    return (
                                      <button key={cat} onClick={() => setPrefCategoryFilter(cat)}
                                        className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-colors ${
                                          prefCategoryFilter === cat ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300'
                                        }`}>
                                        {cat} ({count})
                                      </button>
                                    )
                                  })}
                                </div>
                              )}

                              <div className={`grid gap-4 ${filteredPrefPie && filteredPrefRows?.length > 0 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                                {/* Preference pie chart */}
                                {filteredPrefPie && Object.keys(filteredPrefPie).length > 0 && (() => {
                                  const labels = Object.keys(filteredPrefPie)
                                  const vals   = Object.values(filteredPrefPie)
                                  return (
                                    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
                                      <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-400" />
                                      <div className="p-4">
                                        <p className="text-xs font-bold text-gray-800 mb-0.5">Preference Shareholding</p>
                                        <p className="text-[10px] text-gray-400 mb-3">% share distribution</p>
                                        <div style={{height: 240, width: '100%', position: 'relative'}}>
                                          <Doughnut data={{
                                            labels,
                                            datasets: [{ data: vals, backgroundColor: DONUT_COLORS, borderWidth: 3, borderColor: '#fff', hoverOffset: 10 }]
                                          }} options={{
                                            ...doughnutOpts(result.currencyUnit),
                                            cutout: '55%',
                                            plugins: {
                                              legend: { position: 'bottom', labels: { font:{size:10,weight:'600'}, color:'#6b7280', boxWidth:9, boxHeight:9, usePointStyle:true, pointStyle:'circle', padding:8 } },
                                              tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.raw}%` }, backgroundColor:'#1a1f36', padding:10, cornerRadius:8 }
                                            }
                                          }} />
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })()}

                                <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
                                  <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-400" />
                                  <div className="p-4 overflow-x-auto">
                                    <table className="w-full border-collapse text-xs">
                                      <thead>
                                        <tr className="bg-gray-900">
                                          <th className="text-left py-2 px-3 text-white/80 font-bold text-[11px]">Name</th>
                                          <th className="text-left py-2 px-3 text-white/80 font-bold text-[11px]">Category</th>
                                          <th className="text-right py-2 px-3 text-white/80 font-bold text-[11px]">Shares</th>
                                          <th className="text-right py-2 px-3 text-[#ff7010] font-bold text-[11px]">%</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {filteredPrefRows.map((r, i) => (
                                          <tr key={i} className={`border-b border-gray-100 ${i%2===1?'bg-gray-50/50':''}`}>
                                            <td className="py-2 px-3 font-semibold text-gray-800">{r.name}</td>
                                            <td className="py-2 px-3 text-gray-500">{r.category || '—'}</td>
                                            <td className="py-2 px-3 text-right tabular-nums text-gray-700">{r.shares || '—'}</td>
                                            <td className="py-2 px-3 text-right tabular-nums font-black text-purple-600">{r.percentage || '—'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot>
                                        <tr className="border-t-2 border-gray-800">
                                          <td colSpan={2} className="py-2 px-3 font-black text-gray-900">Total</td>
                                          <td className="py-2 px-3 text-right tabular-nums font-black text-gray-900">{totalPrefShares.toLocaleString('en-IN')}</td>
                                          <td className="py-2 px-3 text-right tabular-nums font-black text-purple-700">
                                            <span className="bg-purple-100 px-2 py-0.5 rounded-md">{totalPrefPct.toFixed(2)}%</span>
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                            )
                          })()}

                          {/* Other Investors — the company profile's raw investor-names list
                              (no category/shares/% recorded, unlike the structured Shareholding
                              Pattern above) — shown only for names not already covered there, so
                              the same person/entity never appears twice. */}
                          {(() => {
                            const known = new Set([...(shareholderRows || []), ...(prefRows || [])]
                              .map(r => (r.name || '').trim().toLowerCase()))
                            const otherInvestors = (result.companyMeta?.investors || [])
                              .filter(name => name && !known.has(name.trim().toLowerCase()))
                            if (otherInvestors.length === 0) return null
                            return (
                              <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="h-1 bg-gradient-to-r from-gray-400 to-gray-300" />
                                <div className="p-4">
                                  <p className="text-xs font-bold text-gray-800 mb-0.5">Other Investors ({otherInvestors.length})</p>
                                  <p className="text-[10px] text-gray-400 mb-3">Named on record — no category or shareholding % available for these</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {otherInvestors.map((name, i) => (
                                      <span key={i} className="text-[11px] font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">{name}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                        )
                      })()}

                      {/* ── Cap Table: "shareholder all"/"shareholder year wise" — one panel
                           per financial year the company's own Excel actually has its own
                           equity/preference block for, straight from
                           equityShareholdersByYear/preferenceShareholdersByYear, in the same
                           shape as it exists in the source workbook (no years fabricated,
                           none silently dropped). Deliberately a simpler table-only rendering
                           (no category filter chips) — stacking the full chip-filtered layout
                           once per year would be a lot of UI for what's meant to be a quick
                           year-over-year scan. ── */}
                      {!singleMetricMode && shareholderYearPanels?.length > 0 && (
                        <div className="border-t border-gray-100 bg-gradient-to-br from-indigo-50/30 to-white px-4 py-5"
                          style={{ animation: 'aiRevealIn 0.4s ease-out both' }}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                              <FaUsers className="text-indigo-500 text-xs" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">Shareholding Pattern — Year by Year</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {shareholderYearPanels.length} financial year{shareholderYearPanels.length > 1 ? 's' : ''} with their own cap-table block on record
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {shareholderYearPanels.map((panel) => {
                              const numOf = (v) => { const n = parseFloat(String(v ?? '').replace(/[,%]/g, '')); return Number.isFinite(n) ? n : 0 }
                              const eqRows   = panel.shareholderTable || []
                              const eqPie    = panel.shareholderPieChart
                              const pfRows   = panel.preferenceShareholderTable || []
                              const pfPie    = panel.preferenceShareholderPieChart
                              const pfCaption = panel.preferenceShareholderCaption
                              const totalEqShares = eqRows.reduce((sum, r) => sum + numOf(r.shares), 0)
                              const totalEqPct    = eqRows.reduce((sum, r) => sum + numOf(r.percentage), 0)
                              // Own card, same polished look as the single-year Shareholding
                              // Pattern section above (gradient top bar, proper-size chart with
                              // its own legend) — not a cramped inline pie squeezed next to the
                              // table. Table 60% / chart 40%, table on the LEFT, chart on the
                              // RIGHT — same systematic grid pattern, just table-first instead
                              // of chart-first.
                              const renderPie = (pie, title) => pie && Object.keys(pie).length > 0 && (
                                <div className="bg-white rounded-2xl shadow-md border border-indigo-100 overflow-hidden">
                                  <div className="h-1 bg-gradient-to-r from-indigo-500 to-indigo-300" />
                                  <div className="p-4">
                                    <p className="text-xs font-bold text-gray-800 mb-0.5">{title}</p>
                                    <p className="text-[10px] text-gray-400 mb-3">% share distribution</p>
                                    <div style={{ height: 220, width: '100%', position: 'relative' }}>
                                      <Doughnut data={{
                                        labels: Object.keys(pie),
                                        datasets: [{ data: Object.values(pie), backgroundColor: DONUT_COLORS, borderWidth: 3, borderColor: '#fff', hoverOffset: 10 }]
                                      }} options={{
                                        ...doughnutOpts(result.currencyUnit),
                                        cutout: '55%',
                                        plugins: {
                                          legend: { position: 'bottom', labels: { font: { size: 10, weight: '600' }, color: '#6b7280', boxWidth: 9, boxHeight: 9, usePointStyle: true, pointStyle: 'circle', padding: 8 } },
                                          tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.raw}%` }, backgroundColor: '#1a1f36', padding: 10, cornerRadius: 8 }
                                        }
                                      }} />
                                    </div>
                                  </div>
                                </div>
                              )
                              const renderTable = (rows, title, sub, accentText, accentBg, totalShares, totalPct) => (
                                <div className="bg-white rounded-2xl shadow-md border border-indigo-100 overflow-hidden">
                                  <div className="h-1 bg-gradient-to-r from-indigo-600 to-purple-400" />
                                  <div className="p-4 overflow-x-auto">
                                    <p className="text-xs font-bold text-gray-800 mb-0.5">{title}</p>
                                    <p className="text-[10px] text-gray-400 mb-3">{sub}</p>
                                    <table className="w-full border-collapse text-xs">
                                      <thead>
                                        <tr className="bg-gray-900">
                                          <th className="text-left py-2.5 px-3 text-white/80 font-bold text-[11px]">Shareholder</th>
                                          <th className="text-left py-2.5 px-3 text-white/80 font-bold text-[11px]">Category</th>
                                          <th className="text-right py-2.5 px-3 text-white/80 font-bold text-[11px]">Shares</th>
                                          <th className="text-right py-2.5 px-3 text-[#ff7010] font-bold text-[11px]">%</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {rows.map((r, i) => (
                                          <tr key={i} className={`border-b border-gray-100 hover:bg-indigo-50/30 transition-colors ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                                            <td className="py-2.5 px-3 font-semibold text-gray-800 max-w-[160px] truncate">{r.name}</td>
                                            <td className="py-2.5 px-3 text-gray-500">{r.category || '—'}</td>
                                            <td className="py-2.5 px-3 text-right tabular-nums text-gray-700 font-medium">{r.shares || '—'}</td>
                                            <td className={`py-2.5 px-3 text-right tabular-nums font-black ${accentText}`}>
                                              <span className={`${accentBg} px-2 py-0.5 rounded-md`}>{r.percentage || '—'}</span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot>
                                        <tr className="border-t-2 border-gray-800">
                                          <td colSpan={2} className="py-2.5 px-3 font-black text-gray-900">Total</td>
                                          <td className="py-2.5 px-3 text-right tabular-nums font-black text-gray-900">{totalShares.toLocaleString('en-IN')}</td>
                                          <td className="py-2.5 px-3 text-right tabular-nums font-black text-gray-900">
                                            <span className={`${accentBg} px-2 py-0.5 rounded-md`}>{totalPct.toFixed(2)}%</span>
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              )
                              return (
                                <div key={panel.year} className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
                                  <div className="h-1 bg-gradient-to-r from-indigo-600 to-purple-400" />
                                  <div className="p-4">
                                    <p className="text-xs font-black text-indigo-700 uppercase tracking-widest mb-3">FY {panel.year}</p>
                                    {eqRows.length > 0 && (
                                      <div className="mb-1 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 items-start">
                                        {renderTable(eqRows, `Equity Shareholders (${eqRows.length})`, `${eqRows.length} shareholders on record`, 'text-indigo-600', 'bg-indigo-50', totalEqShares, totalEqPct)}
                                        {renderPie(eqPie, 'Equity Shareholding')}
                                      </div>
                                    )}
                                    {pfRows.length > 0 && (() => {
                                      const totalPfShares = pfRows.reduce((sum, r) => sum + numOf(r.shares), 0)
                                      const totalPfPct    = pfRows.reduce((sum, r) => sum + numOf(r.percentage), 0)
                                      return (
                                        <div className={`grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 items-start ${eqRows.length > 0 ? 'mt-4 pt-4 border-t border-gray-100' : ''}`}>
                                          {renderTable(pfRows, pfCaption || `Preference Shareholders (${pfRows.length})`, `${pfRows.length} holder(s) on record`, 'text-purple-600', 'bg-purple-50', totalPfShares, totalPfPct)}
                                          {renderPie(pfPie, 'Preference Shareholding')}
                                        </div>
                                      )
                                    })()}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* helper: chart card wrapper */}
                      {(() => {
                        const ChartCard = ({ title, accent = '#6b7280', children }) => (
                          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                            style={{ animation: 'aiRevealIn 0.4s ease-out both' }}>
                            <div className="h-0.5 w-full" style={{background: `linear-gradient(90deg,${accent},${accent}55)`}} />
                            <div className="px-4 pt-3 pb-1">
                              <p className="text-[10px] font-black uppercase tracking-widest" style={{color: accent}}>{title}</p>
                            </div>
                            <div className="px-3 pb-4">{children}</div>
                          </div>
                        )
                        const legendOpts = { display: true, position: 'bottom', labels: { font:{size:10}, color:'#6b7280', boxWidth:9, boxHeight:9, borderRadius:3, padding:8, usePointStyle:true, pointStyle:'circle' } }
                        return (<>

                      {/* ── Row 1: Revenue + PAT ── */}
                      {!singleMetricMode && showFinancials && (revData.length > 0 || patData.length > 0) && (
                        <div className="px-4 pt-4 border-b-0 bg-gray-50/30">
                          {renderYoyTable(yrsForTables, revPatRows)}
                        </div>
                      )}
                      {!singleMetricMode && showFinancials && (revData.length > 0 || patData.length > 0) && (
                        <div className={`grid ${revData.length > 0 && patData.length > 0 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-3 px-4 py-4 border-b border-gray-100 bg-gray-50/30`}>
                          {revData.length > 0 && (
                            <ChartCard title="Revenue" accent="#1a1f36">
                              <div style={{height:165}}>
                                <Bar data={{ labels: revData.map(d => d.year), datasets: [{ data: revData.map(d => d.value), backgroundColor: '#1a1f36', hoverBackgroundColor: '#ff7010', borderRadius: 5 }] }} options={barOpts((v) => fmtMn(v, result.currencyUnit), pctOfRevFn(cd.revenueChart))} />
                              </div>
                            </ChartCard>
                          )}
                          {patData.length > 0 && (
                            <ChartCard title="Net Profit / PAT" accent="#6366f1">
                              <div style={{height:165}}>
                                <Bar data={{ labels: patData.map(d => d.year), datasets: [{ data: patData.map(d => d.value), backgroundColor: patData.map(d => (d.value ?? 0) >= 0 ? '#6366f1' : '#ef4444'), hoverBackgroundColor: '#ff7010', borderRadius: 5 }] }} options={barOpts((v) => fmtMn(v, result.currencyUnit), pctOfRevFn(cd.revenueChart))} />
                              </div>
                            </ChartCard>
                          )}
                        </div>
                      )}

                      {/* ── Ratio detail group — "detail" asked for a specific curated ratio
                           (Revenue-to-Burn, Advertising-to-Sales, ...): its own numerator,
                           denominator and result together, not the single result number or
                           the whole surrounding box. ── */}
                      {result.chartData?.singleMetricGroupStatement?.length > 0 && (
                        <div className="px-4 pt-4 bg-gray-50/30">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse rounded-xl overflow-hidden">
                              <thead>
                                <tr className="bg-gray-900">
                                  <th className="text-left py-3 px-4 text-[11px] font-bold text-white/80">Particulars</th>
                                  {yrsForTables.map(yr => (
                                    <th key={yr} className="text-right py-3 px-3 text-[11px] font-bold text-white/80 whitespace-nowrap">FY {yr}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {result.chartData.singleMetricGroupStatement.map((row, i) => (
                                  <tr key={i} className={`border-b border-gray-100 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                                    <td className="py-3 px-4 text-gray-700 text-xs font-semibold">{cleanStatementLabel(row.label)}</td>
                                    {activeIdxs.map(j => (
                                      <td key={j} className="py-3 px-3 text-right text-xs text-gray-800 tabular-nums font-bold">
                                        {fmtStatementNum(row.values?.[j], row.label, result.currencyUnit)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* ── Row 2: EBITDA + Margins — or, in single-metric focus mode
                           (EBITDA / EBIT / Gross Margin), just that one metric's own
                           trend chart instead. ── */}
                      {singleMetricConfig ? (
                        smSeries.length > 0 && (
                          <div className="px-4 py-4 border-b border-gray-100 bg-gray-50/30 space-y-4">
                            {renderYoyTable(smSeries.map(d => d.year), smYoyRow ? [smYoyRow] : [])}
                            <ChartCard title={singleMetricConfig.title} accent={singleMetricConfig.accent}>
                              <div style={{height:165}}>
                                <Bar data={{
                                  labels: smSeries.map(d => d.year),
                                  datasets: [{ data: smSeries.map(d => d.value), backgroundColor: singleMetricConfig.accent, hoverBackgroundColor: '#ff7010', borderRadius: 5 }]
                                }} options={barOpts(singleMetricConfig.fmt, singleMetricConfig.isCurrency ? pctOfRevFn(cd.revenueChart) : null)} />
                              </div>
                            </ChartCard>
                          </div>
                        )
                      ) : (showFinancials || showOverhead) && (ebiData.length > 0 || margData.length > 1) && (<>
                        {ebiData.length > 0 && (
                          <div className="px-4 pt-4 bg-gray-50/30">
                            {renderYoyTable(yrsForTables, ebitdaRows)}
                          </div>
                        )}
                        {/* Both charts side by side when there's a pair; a lone chart (e.g. a bare
                            "margin" search, which never populates ebitdaChart) spans the full row
                            instead of sitting in a 2-col grid with an empty column beside it —
                            found live: "margin analysis all" showed
                            Margin Profiles squeezed into the left half with the right half blank,
                            the graph only filling half the row. */}
                        <div className={`grid ${ebiData.length > 0 && margData.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-3 px-4 py-4 border-b border-gray-100 bg-gray-50/30`}>
                          {ebiData.length > 0 && (
                            <ChartCard title="EBITDA" accent="#10b981">
                              <div style={{height:165}}>
                                <Bar data={{ labels: ebiData.map(d => d.year), datasets: [{ data: ebiData.map(d => d.value), backgroundColor: '#10b981', hoverBackgroundColor: '#ff7010', borderRadius: 5 }] }} options={barOpts((v) => fmtMn(v, result.currencyUnit), pctOfRevFn(cd.revenueChart))} />
                              </div>
                            </ChartCard>
                          )}
                          {margData.length > 1 && (
                            <ChartCard title="Margin Profiles (%)" accent="#ff7010">
                              <div style={{height: ebiData.length > 0 ? 165 : 220}}>
                                <Line data={{ labels: margData.map(d => d.year), datasets: [
                                  margData[0]?.grossMargin  !== undefined && { label:'Gross',  data: margData.map(d => d.grossMargin  ?? null), borderColor:'#1a1f36', tension:0.4, fill:false, pointRadius:4, borderWidth:2 },
                                  margData[0]?.ebitdaMargin !== undefined && { label:'EBITDA', data: margData.map(d => d.ebitdaMargin ?? null), borderColor:'#6366f1', tension:0.4, fill:false, pointRadius:4, borderWidth:2 },
                                  margData[0]?.netMargin    !== undefined && { label:'Net',    data: margData.map(d => d.netMargin    ?? null), borderColor:'#ff7010', tension:0.4, fill:false, pointRadius:4, borderWidth:2 },
                                ].filter(Boolean) }} options={{...lineOpts, plugins:{...lineOpts.plugins, legend: legendOpts}}} />
                              </div>
                            </ChartCard>
                          )}
                        </div>
                      </>)}

                      {/* ── Row 3: YoY Growth + Cash Flow ── */}
                      {!singleMetricMode && showFinancials && cashFlowRows.length > 0 && (
                        <div className="px-4 pt-4 bg-gray-50/30">
                          {renderYoyTable(yrsForTables, cashFlowRows)}
                        </div>
                      )}
                      {!singleMetricMode && showFinancials && (grwData.length > 0 || cfData.length > 0) && (
                        <div className={`grid ${grwData.length > 0 && cfData.length > 0 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-3 px-4 py-4 border-b border-gray-100 bg-gray-50/30`}>
                          {grwData.length > 0 && (
                            <ChartCard title="Y-o-Y Growth (%)" accent="#6366f1">
                              <div style={{height:165}}>
                                <Bar data={{ labels: grwData.map(d => d.year), datasets: [
                                  { label:'Revenue', data: grwData.map(d => d.revenueGrowth), backgroundColor: grwData.map(d => d.revenueGrowth >= 0 ? '#6366f1' : '#ef4444'), borderRadius: 5 },
                                  grwData[0]?.profitGrowth !== undefined && { label:'Profit', data: grwData.map(d => d.profitGrowth ?? null), backgroundColor: grwData.map(d => (d.profitGrowth ?? 0) >= 0 ? '#10b981' : '#f59e0b'), borderRadius: 5 },
                                ].filter(Boolean) }} options={{...barOpts(v => v+'%'), plugins:{...barOpts(v=>v+'%').plugins, legend: legendOpts}}} />
                              </div>
                            </ChartCard>
                          )}
                          {cfData.length > 0 && (
                            <ChartCard title="Cash Flow Trends" accent="#06b6d4">
                              <div style={{height:165}}>
                                <Bar data={{ labels: cfData.map(d => d.year), datasets: [
                                  cfData[0]?.operating !== undefined && { label:'Operating', data: cfData.map(d => d.operating ?? null), backgroundColor:'#6366f1', borderRadius:4 },
                                  cfData[0]?.investing !== undefined && { label:'Investing', data: cfData.map(d => d.investing ?? null), backgroundColor:'#f59e0b', borderRadius:4 },
                                  cfData[0]?.financing !== undefined && { label:'Financing', data: cfData.map(d => d.financing ?? null), backgroundColor:'#10b981', borderRadius:4 },
                                ].filter(Boolean) }} options={{...barOpts((v) => fmtMn(v, result.currencyUnit), pctOfRevFn(cd.revenueChart)), plugins:{...barOpts((v) => fmtMn(v, result.currencyUnit), pctOfRevFn(cd.revenueChart)).plugins, legend: legendOpts}}} />
                              </div>
                            </ChartCard>
                          )}
                        </div>
                      )}

                      {/* ── Row 4: Revenue vs Expenses ── */}
                      {!singleMetricMode && showFinancials && rveData.length > 0 && (
                        <div className="px-4 py-4 border-b border-gray-100 bg-gray-50/30">
                          <ChartCard title="Revenue vs Total Expenses" accent="#ef4444">
                            <div style={{height:165}}>
                              <Bar data={{ labels: rveData.map(d => d.year), datasets: [
                                { label:'Revenue',  data: rveData.map(d => d.revenue  ?? null), backgroundColor:'#1a1f36', borderRadius:5 },
                                { label:'Expenses', data: rveData.map(d => d.expenses ?? null), backgroundColor:'#ef4444', borderRadius:5 },
                              ] }} options={{...barOpts((v) => fmtMn(v, result.currencyUnit), pctOfRevFn(cd.revenueChart)), plugins:{...barOpts((v) => fmtMn(v, result.currencyUnit), pctOfRevFn(cd.revenueChart)).plugins, legend: legendOpts}}} />
                            </div>
                          </ChartCard>
                        </div>
                      )}

                        </>)
                      })()}


                      {/* ── RPT: Related Party Transactions — year-wise ── */}
                      {showRpt && rptRows?.length > 0 && (() => {
                        // "amount" arrives pipe-joined across every FY in the source sheet
                        // ("1200000|1500000") — split it back into one column per year,
                        // same convention as ratiosTable's parseVals, so RPT reads FY-by-FY
                        // like every other statement instead of one unreadable blob.
                        const fyYears = result.financialYears || []
                        const rptCols = activeIdxs.length > 0 ? activeIdxs.map(i => fyYears[i]).filter(Boolean) : fyYears
                        const rptColIdxs = activeIdxs.length > 0 ? activeIdxs : fyYears.map((_, i) => i)
                        // Parsed to a number (not left as the raw split string) so it can go
                        // through fmtMn() same as every other rupee figure on this page —
                        // found live: this table was the one place on the whole page still
                        // showing a bare thousands-scale number ("47492.84") with no ₹ prefix
                        // or Mn/Cr/Lakh unit suffix.
                        const splitAmount = (raw) => {
                          if (!raw) return []
                          const all = String(raw).split('|').map(v => v.trim())
                          return rptColIdxs.map(i => {
                            const n = Number(all[i])
                            return all[i] != null && all[i] !== '' && !Number.isNaN(n) ? n : null
                          })
                        }

                        return (
                        <div className="border-t border-gray-100 bg-gradient-to-br from-amber-50/30 to-white px-4 py-5"
                          style={{ animation: 'aiRevealIn 0.4s ease-out both' }}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                              <FaHandshake className="text-amber-500 text-xs" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">Related Party Transactions</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{rptRows.length} transactions on record</p>
                            </div>
                          </div>
                          <div className="bg-white rounded-2xl shadow-md border border-amber-100 overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
                            <div className="p-4 overflow-x-auto">
                              <table className="w-full border-collapse text-xs">
                                <thead>
                                  <tr className="bg-gray-900">
                                    {['Party','Relationship','Nature'].map(h => (
                                      <th key={h} className="text-left py-2.5 px-3 text-white/80 font-bold text-[11px]">{h}</th>
                                    ))}
                                    {rptCols.map(yr => (
                                      <th key={yr} className="text-right py-2.5 px-3 text-white/80 font-bold text-[11px] whitespace-nowrap">FY {yr}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {rptRows.map((r, i) => (
                                    <tr key={i} className={`border-b border-gray-100 hover:bg-amber-50/30 transition-colors ${i%2===1?'bg-gray-50/50':''}`}>
                                      <td className="py-2.5 px-3 font-semibold text-gray-800 max-w-[150px] truncate">{r.party||r.name||'—'}</td>
                                      <td className="py-2.5 px-3 text-gray-500 max-w-[120px] truncate">{r.relationship||'—'}</td>
                                      <td className="py-2.5 px-3 text-gray-600 max-w-[150px] truncate">{r.nature||r.type||'—'}</td>
                                      {splitAmount(r.amount).map((v, vi) => (
                                        <td key={vi} className="py-2.5 px-3 text-right font-bold text-gray-800 tabular-nums whitespace-nowrap">{v != null ? fmtMn(v, result.currencyUnit) : '—'}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Balances outstanding at year end */}
                          {rptBalRows?.length > 0 && (
                            <div className="mt-4 bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
                              <div className="h-1 bg-gradient-to-r from-yellow-400 to-amber-500" />
                              <div className="p-4 overflow-x-auto">
                                <p className="text-xs font-bold text-gray-800 mb-3">Balances Outstanding at Year End ({rptBalRows.length})</p>
                                <table className="w-full border-collapse text-xs">
                                  <thead>
                                    <tr className="bg-gray-900">
                                      {['Party','Relationship','Nature'].map(h => (
                                        <th key={h} className="text-left py-2 px-3 text-white/80 font-bold text-[11px]">{h}</th>
                                      ))}
                                      {rptCols.map(yr => (
                                        <th key={yr} className="text-right py-2 px-3 text-white/80 font-bold text-[11px] whitespace-nowrap">FY {yr}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {rptBalRows.map((r, i) => (
                                      <tr key={i} className={`border-b border-gray-100 hover:bg-amber-50/30 transition-colors ${i%2===1?'bg-gray-50/50':''}`}>
                                        <td className="py-2 px-3 font-semibold text-gray-800 max-w-[150px] truncate">{r.party||r.name||'—'}</td>
                                        <td className="py-2 px-3 text-gray-500 max-w-[120px] truncate">{r.relationship||'—'}</td>
                                        <td className="py-2 px-3 text-gray-600 max-w-[150px] truncate">{r.nature||r.type||'—'}</td>
                                        {splitAmount(r.amount).map((v, vi) => (
                                          <td key={vi} className="py-2 px-3 text-right font-bold text-gray-800 tabular-nums whitespace-nowrap">{v != null ? fmtMn(v, result.currencyUnit) : '—'}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                        )
                      })()}

                      {/* ── Investor Metrics / Ratios (premium grouped cards) ── */}
                      {showRatios && ratiosRows?.length > 0 && (() => {
                        const fyYears = result.financialYears || []

                        // Parse pipe-separated values, then filter to active year indices
                        const parseVals = (raw) => {
                          if (!raw) return []
                          const all = String(raw).split('|').map(v => v.trim()).filter(Boolean)
                          if (activeIdxs.length === fyYears.length || activeIdxs.length === 0) return all
                          return activeIdxs.map(i => all[i] ?? '—').filter(v => v !== undefined)
                        }

                        // Group rows by category
                        const grouped = {}
                        ratiosRows.forEach(r => {
                          const cat = r.category || 'General'
                          if (!grouped[cat]) grouped[cat] = []
                          grouped[cat].push(r)
                        })

                        // Category accent palette
                        const CAT_PALETTE = [
                          { bg: 'from-emerald-500 to-teal-500', light: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', hex: '#10b981' },
                          { bg: 'from-indigo-500 to-violet-500', light: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', hex: '#6366f1' },
                          { bg: 'from-amber-500 to-orange-500', light: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', hex: '#f59e0b' },
                          { bg: 'from-rose-500 to-pink-500', light: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', hex: '#f43f5e' },
                          { bg: 'from-sky-500 to-cyan-500', light: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-700', hex: '#0ea5e9' },
                          { bg: 'from-violet-500 to-purple-500', light: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700', hex: '#8b5cf6' },
                        ]

                        const categories = Object.keys(grouped)

                        // A single named ratio ("ROE all"/"ROE detail", narrowed to just one
                        // row) doesn't need the full multi-category dashboard -- the colored
                        // category bar, the "1 ratios across 1 category" header, and a 2-column
                        // grid that leaves a lone card stranded at half-width. Same "one metric
                        // gets a plain card" treatment the single-year keyMetrics path already
                        // has, extended to the all-years/no-year case. significance is dropped
                        // here (not duplicated) since the Notes section right below already
                        // leads with this same ratio's own significance text.
                        if (ratiosRows.length === 1) {
                          const r = ratiosRows[0]
                          const vals = parseVals(r.value)
                          const latest = vals[vals.length - 1]
                          const prev   = vals.length >= 2 ? vals[vals.length - 2] : null
                          const latestNum = parseFloat(latest)
                          const prevNum   = prev != null ? parseFloat(prev) : null
                          const hasTrend  = prevNum != null && !isNaN(latestNum) && !isNaN(prevNum)
                          const trendUp   = hasTrend && latestNum > prevNum
                          const trendDown = hasTrend && latestNum < prevNum
                          return (
                            <div className="px-6 py-5 border-t border-gray-100" style={{ animation: 'aiRevealIn 0.4s ease-out both' }}>
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{r.name || 'Ratio'}</p>
                              <div className="flex items-end gap-2">
                                <p className="text-2xl font-black text-gray-900 leading-none tabular-nums">{latest || '—'}</p>
                                {hasTrend && (
                                  <span className={`mb-0.5 text-xs font-black flex items-center gap-1 ${trendUp ? 'text-emerald-500' : trendDown ? 'text-rose-500' : 'text-gray-400'}`}>
                                    {trendUp ? <FaArrowUp className="text-[10px]" /> : trendDown ? <FaArrowDown className="text-[10px]" /> : <FaMinus className="text-[10px]" />}
                                    {prevNum !== 0 ? `${Math.abs(((latestNum - prevNum) / Math.abs(prevNum)) * 100).toFixed(1)}%` : ''}
                                  </span>
                                )}
                              </div>
                              {vals.length > 1 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {vals.map((v, vi) => {
                                    const realIdx = activeIdxs[vi] ?? vi
                                    const yr = fyYears[realIdx] ? String(fyYears[realIdx]).replace('FY','') : `Y${vi+1}`
                                    const isLast = vi === vals.length - 1
                                    return (
                                      <span key={vi} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isLast ? 'text-emerald-700 bg-emerald-50 border border-emerald-100 font-black' : 'text-gray-400 bg-gray-50'}`}>
                                        {yr}: {v}
                                      </span>
                                    )
                                  })}
                                </div>
                              )}
                              {r.formula && (
                                <p className="text-[10px] font-mono text-gray-400 leading-relaxed mt-2">
                                  <span className="font-bold text-gray-500 not-italic font-sans">Formula: </span>
                                  {r.formula.replace(/\s+/g, ' ').trim()}
                                </p>
                              )}
                            </div>
                          )
                        }

                        return (
                          <div className="border-t border-gray-100" style={{ animation: 'aiRevealIn 0.4s ease-out both' }}>
                            {/* section header */}
                            <div className="flex items-center gap-3 px-6 pt-5 pb-4">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-200">
                                <FaChartLine className="text-white text-sm" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-gray-900">Investor Metrics &amp; Ratios</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{ratiosRows.length} ratios across {categories.length} {categories.length === 1 ? 'category' : 'categories'}</p>
                              </div>
                            </div>

                            {/* category blocks */}
                            <div className="px-4 pb-6 space-y-5">
                              {categories.map((cat, ci) => {
                                const pal = CAT_PALETTE[ci % CAT_PALETTE.length]
                                const rows = grouped[cat]
                                return (
                                  <div key={cat} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    {/* category header bar */}
                                    <div className={`bg-gradient-to-r ${pal.bg} px-4 py-2.5 flex items-center justify-between`}>
                                      <p className="text-white text-xs font-black uppercase tracking-widest">{cat}</p>
                                      <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{rows.length} metrics</span>
                                    </div>

                                    {/* metric cards grid */}
                                    <div className={`p-4 grid grid-cols-2 gap-3 ${rows.length >= 3 ? 'sm:grid-cols-3' : ''}`}>
                                      {rows.map((r, ri) => {
                                        const vals = parseVals(r.value)
                                        const latest = vals[vals.length - 1]
                                        const prev   = vals.length >= 2 ? vals[vals.length - 2] : null
                                        const latestNum = parseFloat(latest)
                                        const prevNum   = prev != null ? parseFloat(prev) : null
                                        const hasTrend  = prevNum != null && !isNaN(latestNum) && !isNaN(prevNum)
                                        const trendUp   = hasTrend && latestNum > prevNum
                                        const trendDown = hasTrend && latestNum < prevNum
                                        const trendFlat = hasTrend && latestNum === prevNum

                                        return (
                                          <div key={ri} className={`${pal.light} ${pal.border} border rounded-xl p-3 flex flex-col gap-1.5`}>
                                            {/* ratio name */}
                                            <p className={`text-[9px] font-black uppercase tracking-widest ${pal.text}`}>{r.name || '—'}</p>

                                            {/* big value + trend arrow */}
                                            <div className="flex items-end gap-1.5">
                                              <p className="text-xl font-black text-gray-900 leading-none tabular-nums">{latest || '—'}</p>
                                              {hasTrend && (
                                                <span className={`mb-0.5 text-[10px] font-black flex items-center gap-0.5 ${trendUp ? 'text-emerald-500' : trendDown ? 'text-rose-500' : 'text-gray-400'}`}>
                                                  {trendUp ? <FaArrowUp className="text-[8px]" /> : trendDown ? <FaArrowDown className="text-[8px]" /> : <FaMinus className="text-[8px]" />}
                                                  {!isNaN(latestNum) && !isNaN(prevNum) && prevNum !== 0
                                                    ? `${Math.abs(((latestNum - prevNum) / Math.abs(prevNum)) * 100).toFixed(1)}%`
                                                    : ''}
                                                </span>
                                              )}
                                            </div>

                                            {/* year pills when multiple values */}
                                            {vals.length > 1 && (
                                              <div className="flex flex-wrap gap-1 mt-0.5">
                                                {vals.map((v, vi) => {
                                                  const realIdx = activeIdxs[vi] ?? vi
                                                  const yr = fyYears[realIdx] ? String(fyYears[realIdx]).replace('FY','') : `Y${vi+1}`
                                                  const isLast = vi === vals.length - 1
                                                  return (
                                                    <span key={vi} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${isLast ? `${pal.text} bg-white border ${pal.border} font-black` : 'text-gray-400 bg-white/60'}`}>
                                                      {yr}: {v}
                                                    </span>
                                                  )
                                                })}
                                              </div>
                                            )}

                                            {/* formula — backend already sends this (e.g. "Profit
                                                after tax / Equity and Reserves" for ROE) but it was
                                                never rendered anywhere on this card, only
                                                significance below it was. Collapsed whitespace/line
                                                breaks (the raw Excel-sourced string carries a stray
                                                "\n") into single spaces — this is a one-line caption,
                                                not the source cell's own formatting. */}
                                            {r.formula && (
                                              <p className="text-[9px] font-mono text-gray-400 leading-relaxed mt-0.5">
                                                <span className="font-bold text-gray-500 not-italic font-sans">Formula: </span>
                                                {r.formula.replace(/\s+/g, ' ').trim()}
                                              </p>
                                            )}

                                            {/* significance — full text, not truncated: the
                                                ratio's significance wasn't being read properly —
                                                line-clamp-2 was
                                                cutting every explanation off after 2 lines with
                                                "…", even though the real (often 2-4 sentence)
                                                text was already there in full underneath it). */}
                                            {r.significance && (
                                              <p className="text-[9px] text-gray-500 leading-relaxed mt-0.5">{r.significance}</p>
                                            )}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })()}

                      {/* ── Overhead Costs: Burn Rate · Employee Expenses · Other Expenses · Ad Spend ── */}
                      {!singleMetricMode && showOverhead && (burnRows?.length > 0 || empRows?.length > 0 || otherExpRows?.length > 0 || adsRows?.length > 0) && (() => {
                        const fyYears = result.financialYears || []
                        const cols = activeIdxs.length > 0 ? activeIdxs.map(i => fyYears[i]).filter(Boolean) : fyYears

                        const OverheadTable = ({ title, sub, rows, accent }) => {
                          if (!rows?.length) return null
                          return (
                            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
                              <div className="h-1" style={{background: `linear-gradient(90deg, ${accent}, ${accent}88)`}} />
                              <div className="p-4 overflow-x-auto">
                                <p className="text-xs font-bold text-gray-800 mb-0.5">{title}</p>
                                <p className="text-[10px] text-gray-400 mb-3">{sub}</p>
                                <table className="w-full border-collapse text-xs">
                                  <thead>
                                    <tr className="bg-gray-900">
                                      <th className="text-left py-2.5 px-3 text-white/80 font-bold text-[11px]">Particulars</th>
                                      {cols.map(yr => (
                                        <th key={yr} className="text-right py-2.5 px-3 text-white/80 font-bold text-[11px] whitespace-nowrap">FY {yr}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {rows.map((r, i) => (
                                      <tr key={i} className={`border-b border-gray-100 hover:bg-orange-50/30 transition-colors ${i%2===1?'bg-gray-50/50':''}`}>
                                        <td className="py-2.5 px-3 font-semibold text-gray-800 max-w-[180px] truncate">{r.label}</td>
                                        {cols.map(yr => (
                                          <td key={yr} className="py-2.5 px-3 text-right tabular-nums text-gray-700">{fmtMn(r[yr], result.currencyUnit)}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )
                        }

                        return (
                          <div className="border-t border-gray-100 bg-gradient-to-br from-orange-50/30 to-white px-4 py-5">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                                <FaMoneyBillWave className="text-orange-500 text-xs" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">Overhead Costs</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">Burn rate, employee &amp; other expenses, ad spend — as per the source workbook</p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <OverheadTable title="Burn Metrics"           sub="Cash burn rate / runway indicators"        rows={burnRows}     accent="#f59e0b" />
                              <OverheadTable title="Employee Expenses"      sub="Salary, benefits & headcount-related costs" rows={empRows}      accent="#6366f1" />
                              <OverheadTable title="Other Expenses"         sub="Administrative & operating overhead"        rows={otherExpRows} accent="#ef4444" />
                              <OverheadTable title="Advertising / Ad Spend" sub="Marketing & promotional spend metrics"      rows={adsRows}      accent="#06b6d4" />
                            </div>
                          </div>
                        )
                      })()}

                      {/* ── Unified Doughnut / Distribution Section ── */}
                      {!singleMetricMode && showDoughnuts && (() => {
                        const donutCards = [
                          hasRevByYear && { title: 'Revenue by Year', sub: 'All FY contribution', data: mkDoughnut(revByYearObj), fmt: (c) => `${c.label}: ${fmtMn(c.raw, result.currencyUnit)}` },
                          hasEarnings  && { title: 'Earnings Breakdown', sub: revData[revData.length-1]?.year ? `FY ${revData[revData.length-1].year}` : 'Latest Year', data: mkDoughnut(earningsObj), fmt: (c) => `${c.label}: ${fmtMn(c.raw, result.currencyUnit)}` },
                          hasPatByYear && { title: 'Net Profit by Year', sub: 'Profitable years only', data: mkDoughnut(patByYearObj), fmt: (c) => `${c.label}: ${fmtMn(c.raw, result.currencyUnit)}` },
                          expBk && { title: 'Expense Composition', sub: 'Cost breakdown', data: mkDoughnut(expBk), fmt: (c) => `${c.label}: ${fmtMn(c.raw, result.currencyUnit)}` },
                          astBk && { title: 'Asset Composition',   sub: 'Asset allocation', data: mkDoughnut(astBk), fmt: (c) => `${c.label}: ${fmtMn(c.raw, result.currencyUnit)}` },
                          capBk && { title: 'Capital Structure',   sub: 'Debt vs equity', data: mkDoughnut(capBk), fmt: (c) => `${c.label}: ${fmtMn(c.raw, result.currencyUnit)}` },
                        ].filter(Boolean)
                        if (!donutCards.length) return null
                        return (
                          <div className="border-t border-gray-100 bg-gradient-to-b from-slate-50/60 to-white">
                            {/* section header */}
                            <div className="px-6 pt-5 pb-4 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-orange-200">
                                <FaChartBar className="text-white text-sm" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">Distribution Overview</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">Breakdown — all financial years combined</p>
                              </div>
                            </div>
                            {/* premium bar chart cards grid */}
                            <div className={`px-4 pb-6 grid gap-4 ${donutCards.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : donutCards.length === 4 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                              {(() => {
                                const ACCENTS = ['#ff7010','#6366f1','#1a1f36','#10b981','#f59e0b','#8b5cf6']
                                return donutCards.map((card, idx) => {
                                  const accent = ACCENTS[idx % ACCENTS.length]
                                  const totalVal = card.data.datasets[0]?.data?.reduce((a, b) => a + (b || 0), 0) || 0
                                  return (
                                    <div key={idx} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                                      {/* colored top stripe */}
                                      <div className="h-1.5 w-full" style={{background: `linear-gradient(90deg, ${accent}, ${accent}88)`}} />
                                      <div className="p-5">
                                        {/* card header */}
                                        <div className="flex items-start justify-between mb-1">
                                          <div>
                                            <p className="text-sm font-bold text-gray-900">{card.title}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{card.sub}</p>
                                          </div>
                                          <div className="text-right flex-shrink-0 ml-2">
                                            <p className="text-xs font-bold" style={{color: accent}}>{fmtMn(totalVal, result.currencyUnit)}</p>
                                            <p className="text-[9px] text-gray-400">Total</p>
                                          </div>
                                        </div>
                                        {/* chart — position relative needed by Chart.js responsive */}
                                        <div style={{height: 230, width: '100%', position: 'relative'}} className="mt-3">
                                          <Bar
                                            data={{
                                              labels: card.data.labels,
                                              datasets: [{
                                                data: card.data.datasets[0].data,
                                                backgroundColor: card.data.datasets[0].backgroundColor,
                                                borderRadius: 6,
                                                maxBarThickness: 56,
                                              }]
                                            }}
                                            options={{
                                              responsive: true,
                                              maintainAspectRatio: false,
                                              plugins: {
                                                legend: { display: false },
                                                tooltip: {
                                                  callbacks: {
                                                    label: (c) => ` ${card.fmt(c)}`,
                                                    labelTextColor: () => '#fff',
                                                  },
                                                  backgroundColor: '#1a1f36',
                                                  titleFont: { size: 11 },
                                                  bodyFont: { size: 12, weight: 'bold' },
                                                  padding: 10,
                                                  cornerRadius: 8,
                                                }
                                              },
                                              scales: {
                                                x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#6b7280' } },
                                                y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 }, color: '#9ca3af', callback: (v) => fmtMn(v, result.currencyUnit) } },
                                              }
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })
                              })()}
                            </div>
                          </div>
                        )
                      })()}

                    </>)
                  })()}
                  </Reveal>

                  {/* ── Annual Performance ── */}
                  <Reveal index={4}>
                  {!result.aiCalculation && !singleMetricMode && (lastSearchedTypes.length === 0 || lastSearchedTypes.includes('financialStatements')) && result.summary && (
                    <div className="px-6 py-5 border-t border-b border-gray-100 bg-gradient-to-r from-orange-50/30 to-transparent">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-4 rounded-full bg-[#ff7010]" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-700">Annual Performance</p>
                        </div>
                        <CopyButton className="text-gray-400 hover:text-gray-700" text={result.summary} />
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed pl-3"><TypewriterText instant={instant} text={result.summary} start={startAt(0)} onDone={advance(0)} /></p>
                    </div>
                  )}
                  </Reveal>


                  {/* ── Financial Table (financial intents only) ── */}
                  {/* Suppressed alongside the AI Calculated Answer card for the same reason
                       as the Financial Statements block below — don't show the raw Excel
                       numbers a second time once the computed answer is already on screen. */}
                  <Reveal index={5}>
                  {!result.aiCalculation && !singleMetricMode && (lastSearchedTypes.length === 0 || lastSearchedTypes.includes('financialStatements')) && result.chartData?.tableData?.length > 0 && result.financialYears?.length > 0 && (() => {
                    const allYears   = result.financialYears
                    const activeIdxs = selectedYears.length > 0
                      ? [...selectedYears].sort((a, b) => a - b)
                      : allYears.map((_, i) => i)
                    const visibleYrs = activeIdxs.map(i => allYears[i]).filter(Boolean)
                    // Plain search: stay a light 6-row summary — the Company Overview card
                    // above already covers Total Liabilities/ROE/etc. Only pull in the full
                    // FY-by-FY breakdown of those same rows once "financial statement" is
                    // explicitly asked for, same gate as the statements accordion below.
                    const wantsFullGlance = isFinancialStatementSearch(result.query, lastSearchedTypes)
                    const glanceRows = wantsFullGlance
                      ? [...result.chartData.tableData, ...buildExtraGlanceRows(result)]
                      : result.chartData.tableData
                    return (
                    <div className="px-6 py-5 border-b border-gray-100 overflow-x-auto" style={{ animation: 'aiRevealIn 0.4s ease-out both' }}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4 rounded-full bg-indigo-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-700">Financials at a Glance</p>
                        <span className="ml-auto text-[10px] text-gray-400 font-medium">All figures in ₹ {result.currencyUnit || 'Mn'}</span>
                      </div>
                      <table className="w-full text-sm border-collapse rounded-xl overflow-hidden">
                        <thead>
                          <tr className="bg-gray-900">
                            <th className="text-left py-3 px-4 min-w-[200px] text-[11px] font-bold text-white/80 whitespace-nowrap">Particulars</th>
                            {visibleYrs.map(yr => (
                              <th key={yr} className="text-right py-3 px-4 min-w-[110px] text-[11px] font-bold text-white/80 whitespace-nowrap">FY {yr}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {glanceRows.map((row, i) => (
                            <tr key={i} className={`border-b border-gray-100 transition-colors hover:bg-orange-50/30 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                              <td className="py-3 px-4 min-w-[200px] whitespace-nowrap text-gray-700 text-xs font-semibold">{row.label}</td>
                              {activeIdxs.map(j => (
                                <td key={j} className="py-3 px-4 min-w-[110px] whitespace-nowrap text-right text-xs text-gray-800 tabular-nums font-bold">
                                  {row.values?.[j] ?? '—'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    )
                  })()}
                  </Reveal>

                  {/* ── Full Financial Statements: Balance Sheet / P&L / Cash Flow ──
                       Bold section headings (e.g. "Shareholders' Funds", "Non-Current
                       Liabilities") — expanded by default; click a heading to collapse it.
                       Opt-in only: the Company Overview above already covers the summary
                       numbers for a plain search, so this only shows when the query itself
                       asks for "financial statement(s)" or that report type was selected. ── */}
                  {/* Suppressed whenever the AI Calculated Answer card is already showing —
                       that card already gives the computed answer; the raw Excel-order
                       statement table underneath it just duplicated the same numbers in a
                       second, unasked-for format. */}
                  <Reveal index={6}>
                  {!result.aiCalculation &&
                    result.financialYears?.length > 0 &&
                    (
                      // The "big 3" statements stay opt-in (explicit "financial statement(s)"
                      // wording, or a report-type selection) -- the Company Overview snapshot
                      // above already covers summary numbers for a plain search, so the full
                      // raw statement table only shows when actually asked for.
                      ((isFinancialStatementSearch(result.query, lastSearchedTypes) ||
                        ['revenue', 'profit', 'balance', 'cashflow', 'expense', 'margin'].includes(result.intent)) &&
                       (result.chartData?.balanceSheetStatement?.length > 0 ||
                        result.chartData?.profitLossStatement?.length > 0 ||
                        result.chartData?.cashFlowStatement?.length > 0 ||
                        result.chartData?.marginAnalysisStatement?.length > 0))
                      ||
                      // Burn/Employee/Other-Expenses/Ads statements render whenever the backend
                      // actually sent them, regardless of result.intent -- that Java-only field
                      // is never set by the Python engine now serving these queries (same dead
                      // field already worked around for the Company Overview snapshot above), so
                      // this whole table silently never rendered for "net cash runway"/"burn rate
                      // monthly"/"other expenses" style queries even though the backend's own
                      // response already carries the full breakdown. Found live: "net cash runway
                      // 2023-24" showed only its own Key Highlights text with no supporting table
                      // at all, despite chartData.burnMetricsStatement having 25+ real rows.
                      (result.chartData?.burnMetricsStatement?.length > 0 ||
                       result.chartData?.employeeExpensesStatement?.length > 0 ||
                       result.chartData?.otherExpensesStatement?.length > 0 ||
                       result.chartData?.adsMetricsStatement?.length > 0)
                    ) && (() => {
                    const allYears   = result.financialYears
                    const activeIdxs = selectedYears.length > 0
                      ? [...selectedYears].sort((a, b) => a - b)
                      : allYears.map((_, i) => i)
                    const visibleYrs = activeIdxs.map(i => allYears[i]).filter(Boolean)
                    return (
                      <div className="px-6 py-5 border-b border-gray-100 space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-4 rounded-full bg-emerald-500" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-700">Financial</p>
                          <span className="ml-auto text-[10px] text-gray-400 font-medium">Currency in ₹ {result.currencyUnit || 'Mn'}</span>
                        </div>
                        {result.chartData.balanceSheetStatement?.length > 0 && (
                          <StatementBlock title="Balance Sheet" accent="#1a1f36" Icon={FaTable}
                            rows={result.chartData.balanceSheetStatement}
                            activeIdxs={activeIdxs} visibleYrs={visibleYrs} statementKey="bs"
                            openGroups={openStatementGroups} onToggle={toggleStatementGroup} currencyUnit={result.currencyUnit} />
                        )}
                        {result.chartData.profitLossStatement?.length > 0 && (
                          <StatementBlock title="Profit & Loss" accent="#6366f1" Icon={FaChartLine}
                            rows={result.chartData.profitLossStatement}
                            activeIdxs={activeIdxs} visibleYrs={visibleYrs} statementKey="pl"
                            openGroups={openStatementGroups} onToggle={toggleStatementGroup} currencyUnit={result.currencyUnit} />
                        )}
                        {result.chartData.cashFlowStatement?.length > 0 && (
                          <StatementBlock title="Cash Flow" accent="#06b6d4" Icon={FaMoneyBillWave}
                            rows={result.chartData.cashFlowStatement}
                            activeIdxs={activeIdxs} visibleYrs={visibleYrs} statementKey="cf"
                            openGroups={openStatementGroups} onToggle={toggleStatementGroup} currencyUnit={result.currencyUnit} />
                        )}
                        {result.chartData.marginAnalysisStatement?.length > 0 && (
                          <StatementBlock title="Margin Analysis" accent="#10b981" Icon={FaChartPie}
                            rows={result.chartData.marginAnalysisStatement}
                            activeIdxs={activeIdxs} visibleYrs={visibleYrs} statementKey="margin"
                            openGroups={openStatementGroups} onToggle={toggleStatementGroup} currencyUnit={result.currencyUnit} />
                        )}
                        {result.chartData.burnMetricsStatement?.length > 0 && (
                          // Alarm red + warning-triangle icon removed -- the only one of these 8
                          // statement blocks styled like an error/warning state instead of a
                          // plain data category the same calm way Balance Sheet/P&L/Cash Flow/
                          // Margin/Employee/Other Expenses/Ads all already are. Burn Metrics is
                          // an ordinary section, not a flagged problem.
                          <StatementBlock title="Burn Metrics" accent="#f43f5e" Icon={FaChartLine}
                            rows={result.chartData.burnMetricsStatement}
                            activeIdxs={activeIdxs} visibleYrs={visibleYrs} statementKey="burn"
                            openGroups={openStatementGroups} onToggle={toggleStatementGroup} currencyUnit={result.currencyUnit} />
                        )}
                        {result.chartData.employeeExpensesStatement?.length > 0 && (
                          <StatementBlock title="Employee Expenses" accent="#8b5cf6" Icon={FaUsers}
                            rows={result.chartData.employeeExpensesStatement}
                            activeIdxs={activeIdxs} visibleYrs={visibleYrs} statementKey="emp"
                            openGroups={openStatementGroups} onToggle={toggleStatementGroup} currencyUnit={result.currencyUnit} />
                        )}
                        {result.chartData.otherExpensesStatement?.length > 0 && (
                          <StatementBlock title="Other Expenses" accent="#f59e0b" Icon={FaChartPie}
                            rows={result.chartData.otherExpensesStatement}
                            activeIdxs={activeIdxs} visibleYrs={visibleYrs} statementKey="oexp"
                            openGroups={openStatementGroups} onToggle={toggleStatementGroup} currencyUnit={result.currencyUnit} />
                        )}
                        {result.chartData.adsMetricsStatement?.length > 0 && (
                          <StatementBlock title="Ads / Advertisement Metrics" accent="#ff7010" Icon={FaChartBar}
                            rows={result.chartData.adsMetricsStatement}
                            activeIdxs={activeIdxs} visibleYrs={visibleYrs} statementKey="ads"
                            openGroups={openStatementGroups} onToggle={toggleStatementGroup} currencyUnit={result.currencyUnit} />
                        )}
                      </div>
                    )
                  })()}
                  </Reveal>

                  {/* ── Notes — same plain style as the single-metric card's own Notes
                      block (small uppercase label, dot-bullet text, no numbered/colored
                      boxes, no "Key Highlights"/"N insights identified" framing). ── */}
                  <Reveal index={7}>
                  {!result.aiCalculation && !isFinancialStatementQuery && !singleMetricMode && result.insights?.length > 0
                    && startAt(result.summary ? 1 : 0) && (
                    <div className="px-6 py-6 border-b border-gray-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Notes</p>
                      <div className="space-y-1.5">
                        {result.insights.map((ins, i) => {
                          // Stage 0 belongs to the summary paragraph above (when it's shown) —
                          // insights only start typing once it finishes, so the whole card reads
                          // top to bottom instead of every block animating at once.
                          const stageNum = (result.summary ? 1 : 0) + i
                          if (!startAt(stageNum)) return null
                          return (
                            <p key={i} className="flex items-start gap-1.5 text-xs text-gray-600 leading-relaxed">
                              <span className="w-1 h-1 rounded-full bg-[#ff7010] flex-shrink-0 mt-1.5" />
                              <span><TypewriterText instant={instant} text={ins} start={startAt(stageNum)} onDone={advance(stageNum)} /></span>
                            </p>
                          )
                        })}
                      </div>

                      {/* ── Quick actions ── */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <button
                          onClick={handleMultiDownload}
                          disabled={!selectedTypes.length}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-[#ff7010] text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                          <FaDownload className="text-[10px]" />
                          Download PDF of this
                        </button>
                        {/* "Compare FY .. vs FY .." quick-action chip removed per explicit request. */}
                      </div>
                    </div>
                  )}
                  </Reveal>


                </div>
                )}


              </div>
              )
}

const Turn = ({ turn, onFollowUp, onEditQuery, scrollAnchorRef }) => {
  // Turns restored from sidebar history (loadHistoryResult stamps every one of them with
  // the source item's id) show their saved text immediately — no replayed "typing" effect.
  const instant = !!turn.historyId
  return (
  <div className="space-y-3" ref={scrollAnchorRef}>
    <UserBubble text={turn.userQuery} onEdit={onEditQuery} />
    {turn.kind === 'error'      && <ErrorTurn message={turn.errorMessage} instant={instant} />}
    {turn.kind === 'glossary'   && <GlossaryTurn result={turn.result} onFollowUp={onFollowUp} instant={instant} />}
    {turn.kind === 'yearCorrection' && <YearCorrectionTurn result={turn.result} onFollowUp={onFollowUp} instant={instant} />}
    {turn.kind === 'yearPrompt' && <YearPromptTurn result={turn.result} instant={instant} />}
    {turn.kind === 'yearRangePrompt' && <YearRangePromptTurn result={turn.result} instant={instant} />}
    {turn.kind === 'ranking'    && <RankingTurn result={turn.result} onFollowUp={onFollowUp} />}
    {turn.kind === 'comparison' && <ComparisonTurn result={turn.result} instant={instant} />}
    {turn.kind === 'metric'     && <FocusedMetricTurn result={turn.result} instant={instant} />}
    {turn.kind === 'answer'     && <AssistantAnswerTurn result={turn.result} onFollowUp={onFollowUp} instant={instant} />}
  </div>
  )
}


// ── Main component ────────────────────────────────────────────────────────────

export default function AiSearchPage() {
  useEffect(() => { document.title = 'Company Intelligence | DealStreetJournal' }, [])

  const { user, logout } = useAuth()
  const isAuth   = !!user
  const navigate = useNavigate()

  // Logs out and sends the user back to the main website (this page has no site
  // header/footer of its own to navigate from otherwise — see "Back to website").
  const handleLogout = async () => {
    try { await logoutApi() } catch { /* still clear local session below regardless */ }
    logout()
    navigate('/')
  }

  // Logged-in user's display name, for the personalized empty-state greeting
  // below ("Hi <name>, ..."). `user` from useAuth() is just the raw email
  // (AuthProvider only ever stores that in a cookie) — the actual profile,
  // including fullName, lives behind its own /user/profile call.
  const [displayName, setDisplayName] = useState('')
  useEffect(() => {
    if (!isAuth) { setDisplayName(''); return }
    let cancelled = false
    userData().then(d => {
      if (!cancelled) setDisplayName(d?.fullName?.trim() || '')
    }).catch(() => {})
    return () => { cancelled = true }
  }, [isAuth])

  // Search / conversation state — `turns` is the ordered thread (newest = last
  // element); a new search APPENDS a turn instead of replacing the page's one
  // active result, so older turns stay visible and interactive (ChatGPT/Claude-
  // style) instead of disappearing the moment a follow-up question is asked.
  const [query,        setQuery]        = useState('')
  const [pendingQuery, setPendingQuery] = useState(null) // non-null while a search is in flight
  const isSearching = pendingQuery !== null
  const [turns,        setTurns]        = useState([])
  const [step,         setStep]         = useState(0)
  // True while ANY card on the page is still typing itself out (see TypewriterText's own
  // module-level claim/release above) — the network request behind doSearch() finishes
  // (isSearching goes false) well before the answer is done ANIMATING onto the screen, so
  // isSearching alone isn't enough to know when it's actually safe to accept the next
  // query: submitting one while the previous answer is still typing used to interrupt/
  // race with it (a new turn's pin-to-top scroll and TypewriterText claims firing while
  // the old one's intervals were still running) instead of being held back the way
  // ChatGPT/Claude hold the composer until the current response actually finishes.
  const [isTyping, setIsTyping] = useState(false)
  useEffect(() => {
    const listener = (count) => setIsTyping(count > 0)
    _typingListeners.add(listener)
    return () => _typingListeners.delete(listener)
  }, [])

  // Result column width — wide by default so tables/charts use the available
  // screen space instead of sitting in a narrow centered column; drag the
  // handles on the search bar to resize by hand, remembered per-browser.
  const RESULT_WIDTH_MIN = 640
  const RESULT_WIDTH_MAX = 1600
  const [resultWidth, setResultWidth] = useState(() => {
    const saved = Number(localStorage.getItem('dsjAiResultWidth'))
    return saved >= RESULT_WIDTH_MIN && saved <= RESULT_WIDTH_MAX ? saved : 1152
  })
  useEffect(() => { localStorage.setItem('dsjAiResultWidth', String(resultWidth)) }, [resultWidth])

  // Real browser full screen (same as pressing F11) — NOT just widening the
  // result column within the page, which is what the compact/wide toggle used
  // to do here before. `fullscreenchange` also fires if the user exits with the
  // browser's own Esc/F11, so the icon stays in sync either way.
  const [isFullscreen, setIsFullscreen] = useState(false)
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])
  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }

  // Sidebar state
  const [sidebarOpen,       setSidebarOpen]       = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [history,           setHistory]           = useState([])
  const [historyLoading,    setHistoryLoading]    = useState(false)
  const [activeHistoryId,   setActiveHistoryId]   = useState(null)


  // The saved/dragged resultWidth (up to RESULT_WIDTH_MAX=1600) can end up wider
  // than what's actually visible on THIS screen once the sidebar eats into the
  // available space, or on a narrower window than whenever it was last dragged —
  // the resize handles are positioned off the calc'd column edges, so once the
  // column is wider than the real viewport, those edges (and the handles on them)
  // land off-screen with no way to grab them and shrink back down. Clamp to what's
  // actually visible right now, both on mount/resize/sidebar-toggle AND live while
  // dragging, so the handles are always reachable.
  const getMaxResultWidth = useCallback(() => {
    const available = window.innerWidth - (sidebarOpen ? 256 : 0)
    return Math.min(RESULT_WIDTH_MAX, Math.max(RESULT_WIDTH_MIN, available - 80))
  }, [sidebarOpen])

  useEffect(() => {
    const clamp = () => {
      const max = getMaxResultWidth()
      setResultWidth(w => (w > max ? max : w))
    }
    clamp()
    window.addEventListener('resize', clamp)
    return () => window.removeEventListener('resize', clamp)
  }, [getMaxResultWidth])

  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef({ startX: 0, startWidth: 0, side: 'right' })

  const startResize = (e, side) => {
    e.preventDefault()
    resizeRef.current = { startX: e.clientX, startWidth: resultWidth, side }
    setIsResizing(true)
  }

  // Dragging either edge grows/shrinks the column symmetrically (it's centered
  // via mx-auto), so the edge under the cursor tracks the mouse 1:1 — hence
  // the 2x on the width delta.
  useEffect(() => {
    if (!isResizing) return
    document.body.style.userSelect = 'none'
    const onMove = (e) => {
      const { startX, startWidth, side } = resizeRef.current
      const delta = (e.clientX - startX) * (side === 'right' ? 2 : -2)
      setResultWidth(Math.min(getMaxResultWidth(), Math.max(RESULT_WIDTH_MIN, startWidth + delta)))
    }
    const onUp = () => setIsResizing(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isResizing, getMaxResultWidth])

  // Autocomplete state
  const [suggestions,     setSuggestions]     = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSugIdx,    setActiveSugIdx]    = useState(-1)
  const suggestTimer = useRef(null)
  const suggestRef   = useRef(null)

  const inputRef          = useRef(null)
  // ChatGPT/Claude-style scroll anchoring: instead of chasing the bottom of the
  // growing answer, we scroll so the user's OWN just-sent question lands near the
  // top of the viewport and the answer fills in below it. `scrollAnchorRef` always
  // points at "the newest thing on screen" — the in-flight pending bubble while a
  // search is running, or the latest completed turn once it lands — because both
  // attach the same ref and JSX render order (turns.map, then the pending block)
  // means whichever is current wins.
  const scrollAnchorRef   = useRef(null)
  const threadScrollRef   = useRef(null) // the thread's own overflow-y-auto pane — scrolled directly (not via scrollIntoView) so the outer document/window never moves, only this pane
  const threadContentRef  = useRef(null) // the pane's actual growing content wrapper — observed for size changes so the view can follow a card typing itself out (see the ResizeObserver effect below)
  // One id per browser conversation (this thread's `turns` array), sent with every
  // aiFreeSearch() call so DSJ-AI's own history_engine.py can group every turn into a
  // single saved history row instead of one row per search — same threading
  // websitebackend used to do server-side before AI Search started calling DSJ-AI
  // directly. Same lazy-init-once-then-mutate convention as every other plain (non-React-
  // state) ref in this component — a new id doesn't need to trigger a re-render, only
  // handleNewChat() below needs to ever change it.
  const conversationIdRef = useRef(`${Date.now()}-${Math.random().toString(36).slice(2)}`)
  // Tracks which history item's load is the MOST RECENT one requested — a plain ref (not
  // React state) so it updates synchronously, unlike activeHistoryId which only reflects
  // the latest value after a re-render. Guards loadHistoryResult() below against a race:
  // clicking item A then quickly clicking item B before A's fetch resolves used to let
  // whichever response arrived LAST win, regardless of which one the user actually clicked
  // last — a slow/flaky connection could show item A's content while the sidebar still
  // highlighted B as active.
  const latestHistoryRequestRef = useRef(null)

  // ── Load history ────────────────────────────────────────────────────────────

  const loadHistory = useCallback(async () => {
    if (!isAuth) return
    setHistoryLoading(true)
    try {
      const data = await getAiHistory(user)
      setHistory(Array.isArray(data) ? data : [])
    } catch { /* silently ignore */ }
    finally { setHistoryLoading(false) }
  }, [isAuth, user])

  useEffect(() => { loadHistory() }, [loadHistory])

  // ── Autocomplete ─────────────────────────────────────────────────────────────

  const fetchSuggestions = (val) => {
    clearTimeout(suggestTimer.current)
    if (val.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return }
    suggestTimer.current = setTimeout(async () => {
      try {
        const data = await getAiSuggestions(val.trim())
        setSuggestions(Array.isArray(data) ? data : [])
        setShowSuggestions(true)
        setActiveSugIdx(-1)
      } catch { /* ignore */ }
    }, 250)
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const pickSuggestion = (name) => {
    setQuery(name)
    setSuggestions([])
    setShowSuggestions(false)
    setActiveSugIdx(-1)
    inputRef.current?.focus()
  }

  // Loads a past question back into the composer for editing, instead of resubmitting it
  // verbatim — the user fixes the typo/rephrases, then hits Enter themselves same as any
  // other search (see UserBubble's onEdit).
  const handleEditQuery = (text) => {
    setQuery(text)
    setShowSuggestions(false)
    inputRef.current?.focus()
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    fetchSuggestions(val)
  }

  const handleInputKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') doSearch()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSugIdx(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSugIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeSugIdx >= 0) {
        pickSuggestion(suggestions[activeSugIdx])
      } else {
        setShowSuggestions(false)
        doSearch()
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  // ── Thinking animation ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!isSearching) return
    const id = setInterval(() => setStep(s => (s + 1) % THINKING_STEPS.length), 1600)
    return () => clearInterval(id)
  }, [isSearching])

  // ── Search — appends a turn to the thread instead of replacing the page's
  //    one active result ────────────────────────────────────────────────────

  const classifyTurn = (userQuery, data) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    if (data.glossary || data.glossaryHelp) return { id, userQuery, kind: 'glossary', result: data }
    if (data.needsYearCorrection) return { id, userQuery, kind: 'yearCorrection', result: data }
    if (data.needsYearSelection) return { id, userQuery, kind: 'yearPrompt', result: data }
    if (data.needsYearRangeSelection) return { id, userQuery, kind: 'yearRangePrompt', result: data }
    if (data.rankingMode)        return { id, userQuery, kind: 'ranking',    result: data }
    if (data.comparisonMode)     return { id, userQuery, kind: 'comparison', result: data }
    if (data.focusedMetric && !data.aiCalculation) return { id, userQuery, kind: 'metric', result: data }
    // A narrow, single-topic ask that ISN'T the specificItemMode path above but still isn't
    // the full company overview either — "gross sales all years" (Revenue intent), "EBITDA
    // 2023-24" (bare, no "detail"), etc. — found live: these fell
    // through to the old, heavier multi-section dashboard (company header card, "Financials at
    // a Glance", "Key Highlights", sometimes two charts at once) instead of the same simple
    // card every other narrow query on this page now gets. `summary`/`analysis` are BOTH only
    // ever null for a narrow topic (AiSearchService's own narrowTopicMode) — the real company
    // overview always fills them in — and a genuine "financial statement" ask (which also nulls
    // them, but needs its own full statement tables, not a single-value card) is excluded by
    // name. `keyMetrics` capped at 2 — a bucket with 3+ related figures (financial statement's
    // own narrowed set, cap table/RPT's 0) reads as "still a small dashboard", not one figure.
    // `!data.aiCalculation` added after finding live: "Total Revenue
    // vs Total Expenses" also matched "Total Revenue" on its own via specificItemMode (so
    // focusedMetric=true, keyMetrics=[the Total Revenue row]) — this condition doesn't check
    // aiCalculation the way the one above it does, so it grabbed the query first and rendered
    // just the single Total Revenue card, silently dropping the "vs Total Expenses"
    // compareMode card AiCalcEngine had already computed. Same fix as the check above: an
    // aiCalculation answer always wins and goes to the full 'answer' turn, which is the only
    // place that actually renders compareMode/perYear/detailRows.
    const metrics = data.keyMetrics || []
    // The Overhead-Costs tab's own whole-box tables (Other/Employee Expenses, Burn Metrics, Ads
    // Metrics) land in these chartData keys — 'metric' turns route to FocusedMetricTurn, which
    // only ever renders singleMetricChart/singleMetricGroupStatement and has no idea these keys
    // exist. Found live: "other expenses detail" has focusedMetric:false and just
    // ONE keyMetrics tile (the aggregate total), so it satisfied every condition below and got
    // classified 'metric' — silently dropping the 12-row itemized breakdown (Total row included)
    // the backend had already correctly computed in otherExpensesStatement, which only the
    // 'answer' turn actually knows how to render. Same "needs its own full table, not a
    // single-value card" reasoning as the isFinancialStatementSearch exclusion right above.
    const hasWholeBoxStatement = ['otherExpensesStatement', 'employeeExpensesStatement',
      'burnMetricsStatement', 'adsMetricsStatement'].some(k => data.chartData?.[k]?.length > 0)
    if (!data.aiCalculation && !data.summary && !data.analysis && metrics.length > 0 && metrics.length <= 2
        && !isFinancialStatementSearch(userQuery, null) && !hasWholeBoxStatement) {
      return { id, userQuery, kind: 'metric', result: data }
    }
    return { id, userQuery, kind: 'answer', result: data }
  }

  const makeErrorTurn = (userQuery, message) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    userQuery, kind: 'error', result: null, errorMessage: message,
  })

  const doSearch = async (q) => {
    const typedQ = (q || query).trim()
    if (!typedQ) return
    // A query submitted (Enter key, the Search button, or a follow-up chip click) while
    // the previous turn is still in flight OR still typing itself out is held back
    // entirely, not just visually discouraged by a disabled button — Enter can still
    // fire a keydown handler regardless of a button's disabled attribute, so the actual
    // guard has to live here, not only in the button's `disabled`.
    if (isSearching || isTyping) return
    setShowSuggestions(false)
    setSuggestions([])
    // Clear the composer the instant a search is submitted (ChatGPT/Claude-style)
    // instead of leaving the just-searched text sitting in the box — the box goes
    // back to showing its placeholder ("Type company name or ask a question...")
    // so it's immediately ready for whatever's asked next, whether that's a
    // follow-up on the same company or a brand new one.
    setQuery('')

    // If the previous turn asked "which year?" and this one is a BARE year answer
    // ("2024-25", "all", ...) with no company name in it, the box was left empty on
    // purpose — stitch the year back onto that prompt's own company + question to
    // actually search, while still showing the user's bubble as exactly what they
    // typed (not the stitched-together text) so the thread reads naturally.
    const lastTurn = turns[turns.length - 1]
    let apiQ = typedQ
    if (lastTurn?.kind === 'yearPrompt' && isBareYearAnswer(typedQ)) {
      apiQ = `${lastTurn.result.companyName || ''} ${lastTurn.result.query || ''} ${withYearPreposition(typedQ)}`.trim()
    } else if (lastTurn?.kind === 'yearRangePrompt' && isYearRangeAnswer(typedQ)) {
      apiQ = `${lastTurn.result.companyName || ''} ${lastTurn.result.query || ''} ${withYearPreposition(typedQ)}`.trim()
    } else if (isPreviousYearComparisonAnswer(typedQ)) {
      const lastContext = [...turns].reverse().find(t => t.result?.companyName)
      if (lastContext) {
        // "latest year" (not "all years") — skips the backend's own "which year?" gate
        // the same way, but does NOT also trip its "all years"/detail wording check, so
        // the answer stays scoped to just the latest year next to its own immediate
        // previous year (the automatic year-over-year line every multi-year answer
        // already carries) instead of pulling in the whole multi-year trajectory since
        // inception — found live: "Revenue year-on-year" showing a "grown 6174% overall
        // since 2022-23" line when only the latest-vs-previous-year comparison was asked
        // for.
        apiQ = `${lastContext.result.companyName || ''} ${stripYearFromQuery(lastContext.result.query)} latest year`.trim()
      }
    } else if (isBareYearAnswer(typedQ) || isGenericContinuation(typedQ)) {
      // A bare "detail"/"more"/"expand" — or a bare year/"all" typed any time
      // later, not just right after a "which year?" prompt — has no topic of its
      // own. Typed alone it wouldn't fail as "not found" (no company name is even
      // needed to get SOME answer back), it would just silently return a generic
      // Company Overview instead of continuing whatever topic (financial
      // statement, ratios, ...) was actually being discussed. Stitch the previous
      // context (company + its own topic, e.g. "financial statement 2023-24") on
      // BEFORE searching, not just the company name.
      const lastContext = [...turns].reverse().find(t => t.result?.companyName)
      if (lastContext) {
        // A NEW bare-year/"all" answer REPLACES whichever year was already
        // baked into the carried-forward topic — asking for "financial statement
        // 2023-24" then just "all" means "all years now", not "2023-24 AND all".
        // A "detail"-style continuation isn't picking a different year, so its
        // topic is carried forward exactly as-is.
        const baseQuery = isBareYearAnswer(typedQ)
          ? stripYearFromQuery(lastContext.result.query)
          : (lastContext.result.query || '')
        const stitchedAnswer = isBareYearAnswer(typedQ) ? withYearPreposition(typedQ) : typedQ
        apiQ = `${lastContext.result.companyName || ''} ${baseQuery} ${stitchedAnswer}`.trim()
      }
    }

    setPendingQuery(typedQ)
    setActiveHistoryId(null)
    setStep(0)

    // "Not found" comes back as an HTTP 404 (axios REJECTS the promise for it,
    // it doesn't resolve with success:false), so both failure shapes have to be
    // normalized here rather than relying on a single try/catch — a plain
    // try/catch around aiFreeSearch would send every "not found" straight to
    // the catch block, past any success:false check placed after the await.
    const trySearch = async (q) => {
      try {
        const data = await aiFreeSearch(q, user, conversationIdRef.current)
        return { ok: data.success !== false, data, message: data.message }
      } catch (e) {
        return { ok: false, data: null, message: e?.response?.data?.message || 'Search failed. Please try again.' }
      }
    }

    let result = await trySearch(apiQ)
    // A "not found" on a query that didn't itself name a company almost always
    // means the user is continuing to ask about whatever company this thread
    // was already about — e.g. typing just "financial statement 2022-23" right
    // after discussing a company, with no name repeated. Retry once with the
    // most recently identified company in THIS thread attached before actually
    // giving up, same idea as the bare-year stitching above but for any other
    // company-less follow-up, not just a year answer.
    //
    // A bare metric NAME with no company (e.g. just "EBIT" typed right after asking
    // about a company's EBITDA) doesn't fail this way at all — the backend has its own
    // "define this term" glossary fallback for exactly that shape of query, which
    // returns success:true, so the retry-on-failure branch below never even sees it.
    // Found live: typing "EBIT" as a follow-up right after "Astrotalk
    // ... EBITDA 2023-24" showed a textbook definition of EBIT instead of Astrotalk's
    // own EBIT figure — technically a valid answer to "what is EBIT" in isolation, but
    // not what continuing a conversation about a specific company means. Whenever the
    // thread already has a company AND the query didn't name one AND the backend chose
    // the glossary fallback, retry the SAME way as the not-found case — if the
    // company-attached retry succeeds, it's almost certainly what was actually meant,
    // so it wins over the generic definition.
    const isUnattributedGlossary = result.ok && result.data?.glossary
      && [...turns].reverse().find(t => t.result?.companyName)?.result?.companyName
      && !apiQ.toLowerCase().includes([...turns].reverse().find(t => t.result?.companyName).result.companyName.toLowerCase())
    if (!result.ok || isUnattributedGlossary) {
      const lastCompanyName = [...turns].reverse().find(t => t.result?.companyName)?.result?.companyName
      if (lastCompanyName && !apiQ.toLowerCase().includes(lastCompanyName.toLowerCase())) {
        const retry = await trySearch(`${lastCompanyName} ${apiQ}`.trim())
        if (retry.ok) result = retry
      }
    }

    if (!result.ok) {
      setTurns(prev => [...prev, makeErrorTurn(typedQ, result.message || 'No results found.')])
      setPendingQuery(null)
      return
    }
    setTurns(prev => [...prev, classifyTurn(typedQ, result.data)])
    if (isAuth) loadHistory()
    setPendingQuery(null)
  }

  // ── Load history result — restores the WHOLE saved conversation (every turn, in
  //    order), replacing whatever's currently in the thread. Continuing to chat
  //    afterward starts its OWN fresh, separately-saved conversation (conversationIdRef
  //    reset below) rather than appending to the one just loaded — same DSJ-AI-side
  //    threading (see history_engine.py) a live, never-before-saved thread already gets,
  //    just not chained onto history that's already been closed out. ──

  const loadHistoryResult = async (item) => {
    latestHistoryRequestRef.current = item.id
    // A follow-up typed after viewing an old conversation starts its OWN fresh history
    // row, same "unlinked" behavior as before this file could thread conversations again
    // at all — reusing the id of whichever conversation was active before opening history
    // would otherwise silently mix two unrelated conversations into one saved row.
    conversationIdRef.current = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setTurns([])
    setActiveHistoryId(item.id)
    setQuery(item.query)
    setMobileSidebarOpen(false)
    setPendingQuery(item.query)
    setStep(0)
    try {
      const data = await getAiHistoryDetail(item.id, user)
      // A newer history click landed while this one was still in flight — that later
      // request already owns the screen, so applying THIS stale response now would
      // silently replace it with the wrong conversation's content.
      if (latestHistoryRequestRef.current !== item.id) return
      if (data && data.success !== false && Array.isArray(data.turns) && data.turns.length > 0) {
        setTurns(data.turns.map(t => ({ ...classifyTurn(t.query, t.result), historyId: item.id })))
      } else {
        setTurns([makeErrorTurn(item.query, 'Could not load this history item.')])
      }
    } catch {
      if (latestHistoryRequestRef.current !== item.id) return
      setTurns([makeErrorTurn(item.query, 'Failed to load history.')])
    } finally {
      if (latestHistoryRequestRef.current === item.id) setPendingQuery(null)
    }
  }

  // ── New chat — clears the thread back to the empty state ──────────────────

  const handleNewChat = () => {
    conversationIdRef.current = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setTurns([])
    setActiveHistoryId(null)
    setQuery('')
    inputRef.current?.focus()
  }

  // ── Delete / clear history ──────────────────────────────────────────────────

  const deleteItem = async (e, id) => {
    e.stopPropagation()
    try {
      await deleteAiHistoryItem(id, user)
      setHistory(prev => prev.filter(h => h.id !== id))
      if (activeHistoryId === id) { setTurns([]); setActiveHistoryId(null) }
    } catch { /* ignore */ }
  }

  const handleClearAll = async () => {
    if (!window.confirm('Delete all search history?')) return
    try {
      await clearAiHistory(user)
      setHistory([]); setTurns([]); setActiveHistoryId(null)
    } catch { /* ignore */ }
  }

  // When the backend asks which year(s) are wanted, just focus the (empty) search
  // box so the user can immediately type their answer — no text is pre-filled
  // anymore; typing a bare year like "2024-25" is enough, doSearch (above) stitches
  // it back onto this prompt's own company + question automatically. Keyed off the
  // newest turn (not a single `result`) since the year-prompt is just one more turn
  // in the thread — the user's typed answer becomes the NEXT turn, appended after it.
  useEffect(() => {
    const last = turns[turns.length - 1]
    if (!last || last.kind !== 'yearPrompt') return
    inputRef.current?.focus()
  }, [turns])

  // Scroll so the newest question lands near the TOP of the viewport (not the
  // bottom of the growing answer) — same as ChatGPT/Claude: your just-sent message
  // stays put near the top while the answer fills in below it, instead of the view
  // chasing the bottom of the content as it renders/streams. Scrolls the thread's
  // OWN overflow-y-auto pane directly (container.scrollTo) rather than
  // target.scrollIntoView() — scrollIntoView walks up every scrollable ancestor
  // including the outer document, which has a taller-than-viewport footer below
  // <main>, so it was dragging the whole page down and pushing the composer out
  // from its pinned bottom position instead of only scrolling inside the pane.
  useEffect(() => {
    const container = threadScrollRef.current
    const target = scrollAnchorRef.current
    if (!container || !target) return

    const delta = target.getBoundingClientRect().top - container.getBoundingClientRect().top
    container.scrollTo({ top: container.scrollTop + delta, behavior: 'smooth' })

    // The "keep nudging down to follow the stagger-reveal" phase that used to run here for
    // a BLIND, fixed ~1.8s after landing is REMOVED — for a TALL response (e.g. "financial
    // statement all", which stacks Balance Sheet + P&L + Cash Flow in full and renders near-
    // instantly, not typed out), it kept pushing scrollTop toward the bottom for the whole
    // fixed duration regardless of whether the content was still actually growing, dragging
    // the view well past the just-asked question instead of leaving it pinned near the top.
    // Real, content-growth-driven following (typed text actually getting taller) is handled
    // separately below, by the ResizeObserver effect — that one only ever moves the view in
    // response to an actual size change, so it naturally stops the instant typing does.
  }, [turns.length, pendingQuery])

  // Follows the pane's own growing content downward WHILE a card is still typing itself
  // out — ChatGPT's familiar "the view creeps down as the answer streams in" — but only
  // for as long as the viewer hasn't scrolled away to read something further up: scrolling
  // up pauses the follow (checked fresh on every growth tick via `wasNearBottom`, not just
  // once) until they scroll back down themselves, same as every other chat UI with this
  // behavior. Driven by ResizeObserver on the actual content wrapper (fires exactly when a
  // typed block/row grows the layout), not a timer — this is what the pin-to-top effect
  // above deliberately does NOT do for a tall, already-fully-rendered response, since that
  // one only fires once per new turn and never during typing.
  useEffect(() => {
    const container = threadScrollRef.current
    const content = threadContentRef.current
    if (!container || !content) return

    const NEAR_BOTTOM_PX = 64
    let wasNearBottom = true
    const trackPosition = () => {
      wasNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < NEAR_BOTTOM_PX
    }

    const observer = new ResizeObserver(() => {
      if (wasNearBottom) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
      }
    })
    container.addEventListener('scroll', trackPosition, { passive: true })
    observer.observe(content)
    return () => {
      observer.disconnect()
      container.removeEventListener('scroll', trackPosition)
    }
  }, [])

  const grouped = groupHistory(history)

  // ── History list (shared between desktop sidebar and mobile drawer) ──────────

  const HistoryList = ({ onClose }) => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-3 py-3 flex-shrink-0">
        <div className="flex items-center gap-2 px-1">
          <FaHistory className="text-[#ff7010] text-xs" />
          <span className="font-bold text-gray-700 text-sm">Search History</span>
        </div>
        <div className="flex items-center gap-1">
          {history.length > 0 && (
            <button onClick={handleClearAll} title="Clear all"
              className="text-gray-400 hover:text-red-500 hover:bg-gray-200/60 rounded-md p-1.5 transition-colors">
              <FaTrash className="text-xs" />
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-md p-1.5 ml-0.5 transition-colors">
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* New chat — a proper menu row, ChatGPT-style, not just a small corner icon */}
      <div className="px-3 pb-2 flex-shrink-0">
        <button onClick={handleNewChat}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-200/60 transition-colors">
          <FaPlus className="text-[11px] text-gray-500 pointer-events-none" />
          New chat
        </button>
      </div>

      {/* list */}
      <div className="flex-1 overflow-y-auto px-1">
        {historyLoading && (
          <p className="text-center text-xs text-gray-400 py-6">Loading...</p>
        )}
        {!historyLoading && history.length === 0 && (
          <div className="px-4 py-8 text-center">
            <FaHistory className="text-gray-200 text-3xl mx-auto mb-3" />
            <p className="text-xs text-gray-400">No searches yet.<br />Your history will appear here.</p>
          </div>
        )}
        {!historyLoading && Object.entries(grouped).map(([group, items]) =>
          items.length > 0 ? (
            <div key={group}>
              <p className="px-3 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{group}</p>
              {items.map(item => (
                <button key={item.id} onClick={() => loadHistoryResult(item)}
                  className={`w-full text-left px-3 py-2.5 group relative rounded-lg transition-colors ${
                    activeHistoryId === item.id
                      ? 'bg-orange-50 text-[#ff7010]'
                      : 'hover:bg-gray-200/60'
                  }`}>
                  <p className={`text-xs font-semibold truncate ${activeHistoryId === item.id ? 'text-[#ff7010]' : 'text-gray-800'}`}>
                    {item.companyName || item.detectedCompany || 'Company'}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5 pr-5">{item.query}</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">{timeAgo(item.updatedAt || item.createdAt)}</p>
                  <button onClick={(e) => deleteItem(e, item.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                    <FaTimes className="text-xs" />
                  </button>
                </button>
              ))}
            </div>
          ) : null
        )}
      </div>

      {/* login prompt */}
      {!isAuth && (
        <div className="px-4 py-3 border-t border-gray-200 text-center flex-shrink-0">
          <p className="text-xs text-gray-400 mb-1">Login to save search history</p>
          <Link to="/login" className="text-xs text-[#ff7010] font-bold hover:underline">Login →</Link>
        </div>
      )}
    </div>
  )

  // ── Render ──────────────────────────────────────────────────────────────────

  // The actual input pill + autocomplete dropdown — defined once and placed in
  // ONE of two spots depending on the thread (see below), Claude/ChatGPT-style:
  // centered on the empty screen for the very first message, then pinned to the
  // bottom once a conversation is underway. The two spots are mutually exclusive
  // (never both rendered at once), so reusing this one element is safe.
  const composerInput = (
    <div className="relative" ref={suggestRef}>
      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" style={{zIndex:2}} />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder="Type company name or ask a question..."
        className="w-full pl-11 pr-28 py-3.5 rounded-full bg-white border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7010]/40 focus:border-[#ff7010]/60 shadow-sm"
        autoFocus
        autoComplete="off"
      />
      {query && (
        <button onClick={() => { setQuery(''); setSuggestions([]); setShowSuggestions(false); inputRef.current?.focus() }}
          className="absolute right-24 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" style={{zIndex:2}}>
          <FaTimes className="text-sm" />
        </button>
      )}
      <button onClick={() => doSearch()} disabled={isSearching || isTyping || !query.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#ff7010] text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-[#e06000] transition-colors disabled:opacity-40 disabled:cursor-not-allowed" style={{zIndex:2}}>
        {isSearching || isTyping ? '...' : 'Search'}
      </button>

      {/* Dropdown suggestions — direction flips depending on which spot this is
          rendered in (opens downward when centered on the empty screen, upward
          when pinned to the bottom of an active conversation). */}
      {showSuggestions && suggestions.length > 0 && (
        <ul className={`absolute left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden ${
          turns.length === 0 && !isSearching ? 'top-full mt-1' : 'bottom-full mb-1'
        }`} style={{zIndex:50}}>
          {suggestions.map((name, i) => (
            <li key={name}
              onMouseDown={e => { e.preventDefault(); pickSuggestion(name) }}
              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                i === activeSugIdx ? 'bg-orange-50 text-[#ff7010]' : 'text-gray-800 hover:bg-gray-50'
              }`}>
              <FaBuilding className={`flex-shrink-0 text-xs ${i === activeSugIdx ? 'text-[#ff7010]' : 'text-gray-300'}`} />
              <span className="truncate">{name}</span>
            </li>
          ))}
          <li className="px-4 py-2 text-[11px] text-gray-400 border-t border-gray-50 bg-gray-50">
            Press Enter to search · ↑↓ to navigate
          </li>
        </ul>
      )}
    </div>
  )

  // This route is mounted OUTSIDE <Layout/> (see App.jsx) — no site header/footer,
  // so the page owns the full viewport itself; every height below is a plain
  // 100vh/top-0, not offset by Layout's navbar margin like it used to be.
  return (
    <div className="flex bg-white min-h-screen">

      {/* ── Desktop sidebar — light, matching ChatGPT's own actual sidebar
           (near-white, not dark — a subtle right border is the only separation
           from the conversation pane next to it). ── */}
      {sidebarOpen && (
        <aside className="hidden lg:flex flex-col flex-shrink-0 bg-[#F9F9F9] border-r border-gray-200"
          style={{ width: 256, position: 'sticky', top: 0, height: '100vh', alignSelf: 'flex-start' }}>
          <HistoryList onClose={null} />
        </aside>
      )}

      {/* ── Mobile sidebar overlay ── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-72 bg-[#F9F9F9] h-full flex flex-col shadow-2xl">
            <HistoryList onClose={() => setMobileSidebarOpen(false)} />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
        </div>
      )}

      {/* ── Main column — a fixed-height flex pane (not one that grows with
           content) so the composer sits pinned to its bottom edge even when the
           thread is short/empty; the thread area below scrolls INTERNALLY
           (overflow-y-auto) instead of the whole document scrolling, same
           "app pane with an outer page around it" pattern most chat UIs use. ── */}
      <div className="relative flex-1 flex flex-col min-w-0 h-screen">

        {/* drag handles — full pane height so they can be grabbed at any scroll
            position, not just up near the composer; positioned off the edges
            of the resizable column, which is centered within this column. */}
        <div onMouseDown={(e) => startResize(e, 'left')} title="Drag to resize"
          className="hidden lg:block absolute top-0 bottom-0 w-3 cursor-col-resize z-30"
          style={{ left: `calc(50% - ${resultWidth / 2 + 6}px)` }} />
        <div onMouseDown={(e) => startResize(e, 'right')} title="Drag to resize"
          className="hidden lg:block absolute top-0 bottom-0 w-3 cursor-col-resize z-30"
          style={{ left: `calc(50% + ${resultWidth / 2 - 6}px)` }} />

        {/* ── Slim top header — navigation/chrome only (sidebar toggle, brand badge,
             New chat, width toggle, breadcrumb). Kept separate from the composer,
             which now lives at the BOTTOM of the viewport, ChatGPT/Claude-style. ── */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-3 flex-shrink-0 sticky top-0 z-20">
          <div className="relative mx-auto flex items-center gap-3"
            style={{ maxWidth: resultWidth }}>
            {/* This page runs full-screen, outside the site's normal Layout (no
                header/footer — see App.jsx), so this is the only way back. */}
            <Link to="/" title="Back to website"
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs font-semibold flex-shrink-0">
              <FaArrowLeft className="text-[11px]" />
              <span className="hidden sm:inline">Back to website</span>
            </Link>
            <div className="w-px h-4 bg-white/10 flex-shrink-0" />

            {/* desktop: toggle sidebar */}
            <button onClick={() => setSidebarOpen(p => !p)}
              className="hidden lg:block text-gray-400 hover:text-white transition-colors" title="Toggle history">
              <FaBars />
            </button>
            {/* mobile: open drawer */}
            <button onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors" title="Search History">
              <FaHistory />
            </button>

            <div className="bg-orange-500/20 border border-orange-500/30 text-[#ff7010] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <FaRobot className="text-[10px]" /> DSJ AI
            </div>

            <button onClick={handleNewChat} title="New chat"
              className="text-gray-400 hover:text-white transition-colors">
              <FaPlus className="text-xs pointer-events-none" />
            </button>

            {/* Real full screen (F11-equivalent) — not a resize of the result column,
                which is what this used to do; drag the side handles for that instead. */}
            <button onClick={toggleFullscreen}
              className="hidden sm:block text-gray-400 hover:text-white transition-colors ml-auto"
              title={isFullscreen ? 'Exit full screen' : 'Full screen'}>
              {isFullscreen ? <FaCompressAlt /> : <FaExpandAlt />}
            </button>

            {/* Signed-in user's name, replacing the old "DSJ / DSJ AI" breadcrumb — with
                a logout action right next to it, since this page has no site header of
                its own to log out from otherwise (see "Back to website" on the left). */}
            {isAuth && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-300">
                <span className="font-semibold truncate max-w-[160px]">{displayName || user}</span>
                <button onClick={handleLogout} title="Logout"
                  className="text-gray-500 hover:text-white transition-colors">
                  <FaSignOutAlt />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Scrolling conversation thread — scrolls INTERNALLY within the
             fixed-height main column (see above) rather than the whole document,
             so the composer below stays pinned to the pane's bottom edge
             regardless of how much (or little) content is in the thread. ── */}
        <div ref={threadScrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-6 flex flex-col">
          <div ref={threadContentRef} className={`mx-auto space-y-5 w-full flex-1 flex flex-col ${turns.length === 0 ? 'justify-center' : ''} ${isResizing ? '' : 'transition-[max-width] duration-200'}`}
            style={{ maxWidth: resultWidth }}>

            {/* Empty state — Claude-style suggestion cards covering everything the old
                Generate Report panel offered, now that search is the only way in.
                Vertically centered in the ACTUAL available thread height via the parent's
                own `flex-1` above (not an arbitrary vh guess) — found live: a min-h-[Xvh] on
                just this div did nothing once the content's own natural height already
                exceeded it, since min-height only matters when it's the LARGER of the two;
                centering has to come from a flex ancestor that truly spans the full
                available height instead. */}
            {turns.length === 0 && !isSearching && (
              <div className="text-center py-6" style={{ animation: 'aiRevealIn 0.5s ease-out both' }}>
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-[#ff7010] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
                  <FaRobot className="text-white text-3xl" />
                </div>
                <h3 className="font-bold text-gray-800 text-2xl tracking-tight">DSJ Financial AI</h3>
                {/* Small, unobtrusive attribution — same weight Claude gives "Anthropic"
                    under its own name, not part of the main heading. */}
                <p className="text-xs text-gray-400 mt-1 font-medium tracking-wide">Red Lion Technologies Pvt Ltd</p>
                <p className="text-base text-gray-500 mt-4 mb-7">
                  {displayName ? `Hi ${displayName}, how can I help you today?` : 'How can I help you today?'}
                </p>
                {/* Composer lives HERE, centered with the greeting, for the very first
                    message — Claude/ChatGPT's own homepage layout — then moves down to
                    the pinned bottom bar (see below `!(turns.length === 0 ...)` block)
                    the moment a conversation actually starts. */}
                <div className="max-w-xl mx-auto">
                  {composerInput}
                </div>
              </div>
            )}

            {turns.map((turn, idx) => (
              <Turn key={turn.id} turn={turn} onFollowUp={doSearch} onEditQuery={handleEditQuery}
                scrollAnchorRef={idx === turns.length - 1 ? scrollAnchorRef : undefined} />
            ))}

            {isSearching && (
              <div className="space-y-3" ref={scrollAnchorRef}>
                <UserBubble text={pendingQuery} />
                <ThinkingBubble step={step} />
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom composer — only once a conversation is actually underway;
             the very first message is typed into the CENTERED composer above
             instead (Claude/ChatGPT's homepage layout). The LAST flex child of
             the fixed-height main column above, with the thread area as the only
             `flex-1` child, so this naturally sits pinned at the pane's bottom
             edge with no sticky/fixed positioning needed. Plain white/light — no
             dark bar — matching ChatGPT/Claude's own composer, which floats on
             the same light background as the conversation itself. ── */}
        {!(turns.length === 0 && !isSearching) && (
        <div className="bg-white px-4 pt-4 pb-6 flex-shrink-0 border-t border-gray-100"
          style={{ zIndex: 20 }}>
          <div className={`relative mx-auto ${isResizing ? '' : 'transition-[max-width] duration-200'}`}
            style={{ maxWidth: resultWidth }}>
            {composerInput}
          </div>
        </div>
        )}

      </div>
    </div>
  )
}

// ── Metric card ───────────────────────────────────────────────────────────────

const MetricCard = ({ metric }) => {
  const up   = metric.trend === 'up'
  const down = metric.trend === 'down'
  return (
    <div className={`rounded-xl border p-3.5 ${up ? 'bg-green-50 border-green-100' : down ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] text-gray-500 font-medium truncate pr-2">{metric.label}</p>
        {up   && <FaArrowUp   className="text-green-500 flex-shrink-0 text-xs" />}
        {down && <FaArrowDown className="text-red-500   flex-shrink-0 text-xs" />}
        {!up && !down && <FaMinus className="text-gray-400 flex-shrink-0 text-xs" />}
      </div>
      <p className="text-base font-bold text-gray-900 truncate">{metric.value}</p>
    </div>
  )
}