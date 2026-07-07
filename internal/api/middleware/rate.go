package middleware

import "sync"

type client struct {
	limiter *reat.Limiter
	lastSeen time.Time
}


type IPRateLimiter struct {
	ips map[string]*client
	mu sync.Mutex
	r rate.Limit
	b int
}


