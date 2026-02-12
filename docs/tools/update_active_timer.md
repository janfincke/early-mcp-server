# update_active_timer

Update the description/note of the currently running timer.

## Summary {#summary}

The `update_active_timer` tool allows you to modify the description of the active timer without stopping and restarting it. This is useful for adding details as you work.

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
<td><code>description</code></td>
<td>string</td>
<td><span class="param-required">Required</span></td>
<td>The new description/note for the active timer.</td>
</tr>
</tbody>
</table>

## Behavior {#behavior}

1. **Check**: Verifies if there is an active timer.
2. **Update**: Sends a PATCH request to update the note of the active tracking session.
3. **Response**: Confirms update and shows new details.

## Examples {#examples}

### Update Description

```json title="Update Active Timer"
{
  "description": "Working on API integration - implementing authentication"
}
```

**Response:**
```
✅ Active timer updated successfully!

Details:
- Activity: Development
- Description: Working on API integration - implementing authentication
- ID: te_789012
```

## Error Scenarios {#errors}

| Error | Cause | Solution |
|-------|-------|----------|
| "No active timer found to update" | No timer running | Start a timer first with `start_timer` |
| "Description is required" | Missing description | Provide a new description |
