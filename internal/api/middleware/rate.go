package middleware

import (
	"net"
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

type client struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

type IPRateLimiter struct {
	ips map[string]*client
	mu  sync.RWMutex
	r   rate.Limit
	b   int
}

func (i *IPRateLimiter) GetLimiter(ip string) *rate.Limiter {
	i.mu.RLock()
	cl, exists := i.ips[ip]
	i.mu.RUnlock()

	if exists {
		i.mu.Lock()
		cl.lastSeen = time.Now()
		i.mu.Unlock()
		return cl.limiter
	}

	i.mu.Lock()
	defer i.mu.Unlock()

	//check locks

	if cl, exists = i.ips[ip]; exists {
		cl.lastSeen = time.Now()
		return cl.limiter
	}

	limiter := rate.NewLimiter(i.r, i.b)

	i.ips[ip] = &client{
		limiter:  limiter,
		lastSeen: time.Now(),
	}

	return limiter
}

func (i *IPRateLimiter) cleanupEvery(interval, maxAge time.Duration) {
	ticker := time.NewTicker(interval)
	for range ticker.C {
		i.mu.Lock()
		for ip, cl := range i.ips {
			if time.Since(cl.lastSeen) > maxAge {
				delete(i.ips, ip)
			}
		}
		i.mu.Unlock()
	}

}

func NewIPRateLimiter(r rate.Limit, b int) *IPRateLimiter {
	i := &IPRateLimiter{
		ips: make(map[string]*client),
		r:   r,
		b:   b,
	}

	go i.cleanupEvery(1*time.Minute, 3*time.Minute)

	return i

}

func Limit(limiter *IPRateLimiter, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.Header.Get("CF-Connecting-IP")
		if ip == "" {
			ip = r.Header.Get("X-Forwarded-For")
		}

		if ip == "" {
			var err error
			ip, _, err = net.SplitHostPort(r.RemoteAddr)
			if err != nil {
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
		}
		limiterForIP := limiter.GetLimiter(ip)

		if !limiterForIP.Allow() {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			w.Write([]byte(`{"error": "Too many requests. Please slow down."}`))
			return
		}

		next.ServeHTTP(w, r)
	})

}
