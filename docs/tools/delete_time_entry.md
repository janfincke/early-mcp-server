# delete_time_entry

Delete an existing time entry by its ID.

## Summary {#summary}

The `delete_time_entry` tool allows you to permanently remove a time entry from EARLY. This is useful for removing accidental entries or duplicates.

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
<td><code>timeEntryId</code></td>
<td>string</td>
<td><span class="param-required">Required</span></td>
<td>The unique ID of the time entry to delete. You can find this ID using <a href="get_time_entries.md"><code>get_time_entries</code></a>.</td>
</tr>
</tbody>
</table>

## Behavior {#behavior}

### Deletion Process

1. **Validation**: Checks if `timeEntryId` is provided.
2. **Authentication**: Verifies API credentials.
3. **API Call**: Sends a DELETE request to EARLY API.
4. **Response**: Confirms successful deletion.

## Examples {#examples}

### Delete Entry

```json title="Delete Time Entry"
{
  "timeEntryId": "te_123456"
}
```

**Response:**
```
✅ Time entry deleted successfully (ID: te_123456)
```

## Error Scenarios {#errors}

| Error | Cause | Solution |
|-------|-------|----------|
| "Time entry ID is required" | Missing `timeEntryId` | Provide the ID of the entry to delete |
| "Resource not found" | Invalid ID or already deleted | Verify ID with `get_time_entries` |
