const NOTION_API = "https://www.notion.so/api/v3";

export function compactId(id) {
  return String(id || "").replaceAll("-", "").slice(-32);
}

export function idToUuid(id) {
  const raw = compactId(id);
  if (raw.length !== 32) return "";
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}

async function fetchNotionData(resource, body, notionToken, headers = {}) {
  const response = await fetch(`${NOTION_API}/${resource}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(notionToken ? { cookie: `token_v2=${notionToken}` } : {}),
      ...headers,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Notion ${resource} failed with ${response.status}`);
  }

  return response.json();
}

export async function fetchPageById(pageId, notionToken) {
  return fetchNotionData(
    "loadPageChunk",
    {
      pageId: idToUuid(pageId),
      limit: 100,
      cursor: { stack: [] },
      chunkNumber: 0,
      verticalColumns: false,
    },
    notionToken
  );
}

export async function fetchCollection(collectionId, collectionViewId, notionToken, spaceId) {
  const headers = spaceId ? { "x-notion-space-id": spaceId } : {};

  return fetchNotionData(
    "queryCollection",
    {
      collection: {
        id: idToUuid(collectionId),
      },
      collectionView: {
        id: idToUuid(collectionViewId),
      },
      loader: {
        type: "reducer",
        reducers: {
          collection_group_results: {
            type: "results",
            limit: 999,
            loadContentCover: true,
          },
          "table:uncategorized:title:count": {
            type: "aggregation",
            aggregation: {
              property: "title",
              aggregator: "count",
            },
          },
        },
        searchQuery: "",
        userTimeZone: "Asia/Shanghai",
      },
    },
    notionToken,
    headers
  );
}

export function notionText(value) {
  if (!Array.isArray(value)) return "";
  return value.map((item) => item?.[0] || "").join("");
}

export function notionValue(value, type) {
  if (!Array.isArray(value) || value.length === 0) return "";

  if (type === "checkbox") {
    return value[0]?.[0] === "Yes";
  }

  if (type === "title" || type === "text") {
    return notionText(value);
  }

  if (type === "date") {
    return value[0]?.[1]?.find?.((item) => item[0] === "d")?.[1]?.start_date || "";
  }

  if (type === "select" || type === "url" || type === "email" || type === "phone_number") {
    return value[0]?.[0] || "";
  }

  if (type === "multi_select") {
    return String(value[0]?.[0] || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (type === "number") {
    return Number(value[0]?.[0]);
  }

  return notionText(value);
}

export function recordValue(record) {
  return record?.value?.value || record?.value || {};
}

export function rowsFromCollection(collectionRecord, tableRecord) {
  const collection = recordValue(collectionRecord);
  const schema = collection.schema;
  const schemaEntries = Object.entries(schema);
  const blockIds = tableRecord.result.reducerResults.collection_group_results.blockIds;

  return blockIds
    .map((id) => tableRecord.recordMap.block[id])
    .map((block) => ({ record: block, value: recordValue(block) }))
    .filter(({ value }) => value?.properties && value.parent_id === collection.id)
    .map(({ value }) => {
      const row = {
        id: value.id,
        createdTime: value.created_time ? new Date(value.created_time).toISOString() : "",
        lastEditedTime: value.last_edited_time ? new Date(value.last_edited_time).toISOString() : "",
      };

      for (const [propertyId, definition] of schemaEntries) {
        row[definition.name] = notionValue(value.properties[propertyId], definition.type);
      }

      return row;
    });
}
