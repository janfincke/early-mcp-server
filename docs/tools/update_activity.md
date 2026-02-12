# update_activity

Update an existing activity (project) in EARLY.

## Summary {#summary}

The `update_activity` tool allows you to modify an existing activity, such as changing its name, description, or status.

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
<td>The ID of the activity to update.</td>
</tr>
<tr>
<td><code>name</code></td>
<td>string</td>
<td><span class="param-optional">Optional</span></td>
<td>New name for the activity.</td>
</tr>
<tr>
<td><code>description</code></td>
<td>string</td>
<td><span class="param-optional">Optional</span></td>
<td>New description for the activity.</td>
</tr>
<tr>
<td><code>color</code></td>
<td>string</td>
<td><span class="param-optional">Optional</span></td>
<td>New color code.</td>
</tr>
<tr>
<td><code>isActive</code></td>
<td>boolean</td>
<td><span class="param-optional">Optional</span></td>
<td>Set active/inactive status.</td>
</tr>
<tr>
<td><code>clientId</code></td>
<td>string</td>
<td><span class="param-optional">Optional</span></td>
<td>New client ID.</td>
</tr>
<tr>
<td><code>billable</code></td>
<td>boolean</td>
<td><span class="param-optional">Optional</span></td>
<td>New billable status.</td>
</tr>
</tbody>
</table>

## Behavior {#behavior}

1. **Validation**: Checks if `activityId` is provided and at least one field to update.
2. **API Call**: Sends a PUT/PATCH request to update the activity.
3. **Response**: Returns the updated activity details.

## Examples {#examples}

### Rename Activity

```json title="Update Activity"
{
  "activityId": "act_987654",
  "name": "Renamed Project"
}
```

**Response:**
```
✅ Activity updated successfully!

ID: act_987654
Name: Renamed Project
Updated fields: name
```
