# archive_activity

Archive or delete an activity.

## Summary {#summary}

The `archive_activity` tool allows you to archive or delete an activity. Note that this action might be irreversible depending on the API implementation.

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
<td><code>activityId</code></td>
<td>string</td>
<td><span class="param-required">Required</span></td>
<td>The ID of the activity to archive/delete.</td>
</tr>
</tbody>
</table>

## Behavior {#behavior}

1. **Validation**: Checks if `activityId` is provided.
2. **API Call**: Sends a DELETE request to archive/delete the activity.
3. **Response**: Confirms success.

## Examples {#examples}

### Archive Activity

```json title="Archive Activity"
{
  "activityId": "act_987654"
}
```

**Response:**
```
✅ Activity archived/deleted successfully (ID: act_987654)
```
