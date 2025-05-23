import { useState } from 'react';
import { MantineProvider, Container, TextInput, Button, Paper, Title, Text, CopyButton, Group, Stack, Alert, Box, Tabs, Table } from '@mantine/core';
import axios from 'axios';
import '@mantine/core/styles.css';

interface UrlStats {
  originalUrl: string;
  shortUrl: string;
  shortLocalUrl: string;
  createdAt: string;
  totalVisits: number;
  visits: Array<{
    id: string;
    createdAt: string;
    ip: string;
    userAgent: string;
  }>;
}

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [shortLocalUrl, setShortLocalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<string>('shorten');
  
  // Stats state
  const [statsUrl, setStatsUrl] = useState('');
  const [stats, setStats] = useState<UrlStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:4040/api/shorten', { url });
      setShortUrl(response.data.shortUrl);
      setShortLocalUrl(response.data.shortLocalUrl);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to shorten URL');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatsError('');
    setStatsLoading(true);
    setStats(null);

    try {
      // Extract shortCode from URL
      const shortCode = statsUrl.split('/').pop();
      if (!shortCode) {
        throw new Error('Invalid URL format');
      }

      const response = await axios.get(`http://localhost:4040/api/stats/${shortCode}`);
      setStats(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setStatsError(err.response?.data?.error || 'Failed to fetch stats');
      } else {
        setStatsError('An unexpected error occurred');
      }
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <MantineProvider>
      <Box 
        style={{
          minHeight: '100vh',
          background: 'white',
          padding: '20px 0'
        }}
      >
        <Container size="md" style={{ width: '100%' }}>
          <Paper
            shadow="xl"
            p={40}
            radius="lg"
            style={{
              background: 'white',
              backdropFilter: 'blur(10px)',
              maxWidth: '800px',
              margin: '0 auto'
            }}
          >
            <Stack gap="xl">
              <Title
                order={1}
                ta="center"
                style={{
                  fontSize: '2.5rem',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '1rem'
                }}
              >
                URL Shortener
              </Title>

              <Tabs value={activeTab} onChange={(value: string | null) => value && setActiveTab(value)}>
                <Tabs.List grow>
                  <Tabs.Tab value="shorten" style={{ fontSize: '1.1rem' }}>
                    Shorten URL
                  </Tabs.Tab>
                  <Tabs.Tab value="stats" style={{ fontSize: '1.1rem' }}>
                    URL Stats
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="shorten" pt="xl">
                  <form onSubmit={handleSubmit}>
                    <Stack gap="lg">
                      <TextInput
                        required
                        label="Enter your URL"
                        placeholder="https://example.com/very-long-url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        size="lg"
                        styles={{
                          input: {
                            fontSize: '1.1rem',
                            padding: '.5rem',
                          },
                          label: {
                            fontSize: '1.1rem',
                            marginBottom: '1.5rem'
                          }
                        }}
                      />

                      <Button
                        type="submit"
                        loading={loading}
                        size="lg"
                        fullWidth
                        style={{
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          fontSize: '1.1rem',
                          height: '3.5rem'
                        }}
                      >
                        Shorten URL
                      </Button>
                    </Stack>
                  </form>

                  {error && (
                    <Alert 
                      color="red" 
                      title="Error"
                      radius="md"
                      mt="lg"
                      styles={{
                        title: { fontSize: '1.1rem' },
                        message: { fontSize: '1rem' }
                      }}
                    >
                      {error}
                    </Alert>
                  )}

                  {shortUrl && (
                    <Paper
                      withBorder
                      p="xl"
                      radius="md"
                      mt="xl"
                      style={{
                        borderColor: '#667eea',
                        borderWidth: '2px'
                      }}
                    >
                      <Stack gap="md">
                        <Text size="lg" fw={600} c="dimmed">
                          Shortened URL:
                        </Text>
                        <Group justify="space-between" wrap="wrap" gap="md">
                          <Text
                            component="a"
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="xl"
                            c="#667eea"
                            style={{ wordBreak: 'break-all' }}
                          >
                            {shortUrl}
                          </Text>
                          <CopyButton value={shortUrl}>
                            {({ copied, copy }) => (
                              <Button
                                color={copied ? 'teal' : 'blue'}
                                onClick={copy}
                                size="md"
                                variant="light"
                                style={{
                                  minWidth: '100px'
                                }}
                              >
                                {copied ? 'Copied!' : 'Copy'}
                              </Button>
                            )}
                          </CopyButton>
                        </Group>
                      </Stack>
                      <Stack gap="md" mt="xl">
                        <Text size="lg" fw={600} c="dimmed">
                          Shortened Local URL (For testing):
                        </Text>
                        <Group justify="space-between" wrap="wrap" gap="md">
                          <Text
                            component="a"
                            href={shortLocalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="xl"
                            c="#667eea"
                            style={{ wordBreak: 'break-all' }}
                          >
                            {shortLocalUrl}
                          </Text>
                          <CopyButton value={shortLocalUrl}>
                            {({ copied, copy }) => (
                              <Button
                                color={copied ? 'teal' : 'blue'}
                                onClick={copy}
                                size="md"
                                variant="light"
                                style={{
                                  minWidth: '100px'
                                }}
                              >
                                {copied ? 'Copied!' : 'Copy'}
                              </Button>
                            )}
                          </CopyButton>
                        </Group>
                      </Stack>
                    </Paper>
                  )}
                </Tabs.Panel>

                <Tabs.Panel value="stats" pt="xl">
                  <form onSubmit={handleStatsSubmit}>
                    <Stack gap="lg">
                      <TextInput
                        required
                        label="Enter Shortened URL"
                        placeholder="Enter your shortened URL to view stats"
                        value={statsUrl}
                        onChange={(e) => setStatsUrl(e.target.value)}
                        size="lg"
                        styles={{
                          input: {
                            fontSize: '1.1rem',
                            padding: '.5rem',
                          },
                          label: {
                            fontSize: '1.1rem',
                            marginBottom: '1.5rem'
                          }
                        }}
                      />

                      <Button
                        type="submit"
                        loading={statsLoading}
                        size="lg"
                        fullWidth
                        style={{
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          fontSize: '1.1rem',
                          height: '3.5rem'
                        }}
                      >
                        View Stats
                      </Button>
                    </Stack>
                  </form>

                  {statsError && (
                    <Alert 
                      color="red" 
                      title="Error"
                      radius="md"
                      mt="lg"
                      styles={{
                        title: { fontSize: '1.1rem' },
                        message: { fontSize: '1rem' }
                      }}
                    >
                      {statsError}
                    </Alert>
                  )}

                  {stats && (
                    <Paper
                      withBorder
                      p="xl"
                      radius="md"
                      mt="xl"
                      style={{
                        borderColor: '#667eea',
                        borderWidth: '2px'
                      }}
                    >
                      <Stack gap="lg">
                        <div>
                          <Text size="lg" fw={600} c="dimmed">
                            Original URL:
                          </Text>
                          <Text size="md" style={{ wordBreak: 'break-all' }}>
                            {stats.originalUrl}
                          </Text>
                        </div>

                        <div>
                          <Text size="lg" fw={600} c="dimmed">
                            Created At:
                          </Text>
                          <Text size="md">
                            {new Date(stats.createdAt).toLocaleString()}
                          </Text>
                        </div>

                        <div>
                          <Text size="lg" fw={600} c="dimmed">
                            Total Visits:
                          </Text>
                          <Text size="xl" fw={700} c="#667eea">
                            {stats.totalVisits}
                          </Text>
                        </div>

                        {stats.visits.length > 0 && (
                          <div>
                            <Text size="lg" fw={600} c="dimmed" mb="md">
                              Visit History:
                            </Text>
                            <Table>
                              <Table.Thead>
                                <Table.Tr>
                                  <Table.Th>Time</Table.Th>
                                  <Table.Th>IP Address</Table.Th>
                                  <Table.Th>User Agent</Table.Th>
                                </Table.Tr>
                              </Table.Thead>
                              <Table.Tbody>
                                {stats.visits.map((visit) => (
                                  <Table.Tr key={visit.id}>
                                    <Table.Td>{new Date(visit.createdAt).toLocaleString()}</Table.Td>
                                    <Table.Td>{visit.ip}</Table.Td>
                                    <Table.Td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {visit.userAgent}
                                    </Table.Td>
                                  </Table.Tr>
                                ))}
                              </Table.Tbody>
                            </Table>
                          </div>
                        )}
                      </Stack>
                    </Paper>
                  )}
                </Tabs.Panel>
              </Tabs>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </MantineProvider>
  );
}

export default App;
