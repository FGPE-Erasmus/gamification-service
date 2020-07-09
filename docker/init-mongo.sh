#!/usr/bin/env bash
echo "Creating mongo users..."

mongo -- "${DB_INITDB_DATABASE}" <<EOF
  db.createUser(
    {
      "user": "${DB_INITDB_ROOT_USERNAME}",
      "pwd": "${DB_INITDB_ROOT_PASSWORD}",
      "roles": [
        {
          "role": "readWrite",
          "db": "${DB_INITDB_DATABASE}"
        },
      ]
    }
  );
EOF

echo "Mongo users created."
