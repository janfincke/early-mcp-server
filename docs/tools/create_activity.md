# create_activity

Create a new activity (project) in EARLY.

## Summary {#summary}

The `create_activity` tool allows you to create new activities (projects) to track time against.

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
<td><code>name</code></td>
<td>string</td>
<td><span class="param-required">Required</span></td>
<td>Name of the new activity/project.</td>
</tr>
<tr>
<td><code>description</code></td>
<td>string</td>
<td><span class="param-optional">Optional</span></td>
<td>Description of the activity.</td>
</tr>
<tr>
<td><code>color</code></td>
<td>string</td>
<td><span class="param-optional">Optional</span></td>
<td>Color code for the activity (e.g., hex code).</td>
</tr>
<tr>
<td><code>clientId</code></td>
<td>string</td>
<td><span class="param-optional">Optional</span></td>
<td>Client ID to associate with the activity.</td>
</tr>
<tr>
<td><code>billable</code></td>
<td>boolean</td>
<td><span class="param-optional">Optional</span></td>
<td>Whether the activity is billable by default.</td>
</tr>
</tbody>
</table>

## Behavior {#behavior}

1. **Validation**: Checks if `name` is provided.
2. **API Call**: Sends a POST request to create the activity.
3. **Response**: Returns the created activity details.

## Examples {#examples}

### Create Activity

```json title="Create Activity"
{
  "name": "New Project",
  "description": "A brand new project",
  "billable": true
}
```

**Response:**
```
✅ Activity created successfully!

Name: New Project
ID: act_987654
Description: A brand new project
```
