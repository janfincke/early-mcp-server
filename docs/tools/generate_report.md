# generate_report

Generate a summary report of time entries for a given period.

## Summary {#summary}

The `generate_report` tool allows you to create a summarized report of time tracking data. It aggregates entries by activity and provides totals and percentages. This is useful for weekly reviews or billing.

## Parameters {#parameters}

<table class="schema-table">
<thead>
<tr>
<th>Parameter</th>
<th>Type</th>
<th>Required</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>startDate</code></td>
<td>string</td>
<td><span class="param-required">Required</span></td>
<td>Start date for the report period (YYYY-MM-DD).</td>
</tr>
<tr>
<td><code>endDate</code></td>
<td>string</td>
<td><span class="param-required">Required</span></td>
<td>End date for the report period (YYYY-MM-DD).</td>
</tr>
<tr>
<td><code>projectId</code></td>
<td>string</td>
<td><span class="param-optional">Optional</span></td>
<td>Filter report for a specific activity ID.</td>
</tr>
</tbody>
</table>

## Behavior {#behavior}

1. **Validation**: Checks date formats.
2. **Data Fetching**: Retrieves raw time entries for the period.
3. **Aggregation**: Client-side calculation of totals per activity.
4. **Formatting**: Formats durations (e.g., "2h 15m") and calculates percentages.
5. **Response**: Returns a structured text summary.

## Examples {#examples}

### Weekly Report

```json title="Generate Report"
{
  "startDate": "2025-10-13",
  "endDate": "2025-10-19"
}
```

**Response:**
```
📊 Time Report (2025-10-13 to 2025-10-19)

Total Duration: 35h 30m
Entries: 42

By Activity:
- Client Work: 20h 0m (56.3%)
- Internal Meetings: 10h 30m (29.6%)
- Development: 5h 0m (14.1%)
```
